import { SIZES, type Category, type Product, type Size } from "@/lib/schemas";
import { normalize } from "@/lib/text";

/**
 * Importación de productos desde Excel o CSV. Formato: una fila por variante.
 * Las filas con el mismo nombre de producto se agrupan en un solo producto.
 * Son funciones puras: la lectura del archivo (SheetJS) ocurre en el cliente.
 */

export const TEMPLATE_COLUMNS: string[] = [
  "producto",
  "categoria",
  "precio",
  "descripcion",
  "color",
  "talla",
  "existencias",
  "sku",
];

/** Nombres de columna aceptados (sin tildes ni mayúsculas) → campo. */
const HEADER_ALIASES: Record<string, keyof RawFields> = {
  producto: "product",
  nombre: "product",
  categoria: "category",
  precio: "price",
  descripcion: "description",
  color: "color",
  talla: "size",
  existencias: "stock",
  stock: "stock",
  cantidad: "stock",
  sku: "sku",
};

type RawFields = {
  product: string;
  category: string;
  price: string;
  description: string;
  color: string;
  size: string;
  stock: string;
  sku: string;
};

export type ImportRow = {
  /** Número de fila en el archivo (la 1 es el encabezado). */
  line: number;
  product: string;
  category: string;
  price: number | null;
  description: string;
  color: string;
  size: Size | null;
  stock: number | null;
  sku: string;
  errors: string[];
};

export type ImportVariant = { color: string; size: Size; stock: number; sku: string };

export type ImportProduct = {
  name: string;
  category: string;
  price: number;
  description: string;
  variants: ImportVariant[];
  /** Ya existe un producto con ese nombre: se actualizaría. */
  isUpdate: boolean;
  /** La categoría no existe: se crearía. */
  newCategory: boolean;
};

export type ImportResult = {
  rows: ImportRow[];
  products: ImportProduct[];
  /** Problemas del archivo completo (p. ej. columnas faltantes). */
  fileErrors: string[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    newProducts: number;
    updatedProducts: number;
    variants: number;
    units: number;
    newCategories: string[];
  };
};

const REQUIRED: (keyof RawFields)[] = ["product", "category", "price", "color", "size", "stock"];
const FIELD_LABEL: Record<keyof RawFields, string> = {
  product: "producto",
  category: "categoria",
  price: "precio",
  description: "descripcion",
  color: "color",
  size: "talla",
  stock: "existencias",
  sku: "sku",
};

const cell = (value: unknown): string => (value === null || value === undefined ? "" : String(value).trim());

/** "₡12.000", "12 000", "12000" → 12000 */
function parseInteger(raw: string): number | null {
  const digits: string = raw.replace(/[₡\s.,]/g, "");
  if (!/^\d+$/.test(digits)) return null;
  return Number(digits);
}

function parseSize(raw: string): Size | null {
  const value: string = normalize(raw).replace(/\s+/g, "");
  if (["unica", "u", "tallaunica"].includes(value)) return "Única";
  if (value === "xxl") return "2XL";
  return SIZES.find((s: Size): boolean => s.toLowerCase() === value) ?? null;
}

export function analyzeImport(
  records: Record<string, unknown>[],
  categories: Category[],
  existing: Product[],
): ImportResult {
  const fileErrors: string[] = [];

  // Columnas presentes en el archivo.
  const headerMap: Map<string, keyof RawFields> = new Map<string, keyof RawFields>();
  for (const header of Object.keys(records[0] ?? {})) {
    const field: keyof RawFields | undefined = HEADER_ALIASES[normalize(header).replace(/\s+/g, "")];
    if (field) headerMap.set(header, field);
  }
  const present: Set<keyof RawFields> = new Set<keyof RawFields>(headerMap.values());
  const missing: (keyof RawFields)[] = REQUIRED.filter((f: keyof RawFields): boolean => !present.has(f));
  if (records.length === 0) fileErrors.push("El archivo no tiene filas con datos.");
  if (missing.length > 0 && records.length > 0) {
    fileErrors.push(
      `Faltan columnas: ${missing.map((f: keyof RawFields): string => FIELD_LABEL[f]).join(", ")}. Descarga la plantilla para ver el formato.`,
    );
  }

  const categoryNames: Set<string> = new Set<string>(
    categories.flatMap((c: Category): string[] => [normalize(c.name), normalize(c.slug)]),
  );
  const existingNames: Set<string> = new Set<string>(existing.map((p: Product): string => normalize(p.name)));

  const rows: ImportRow[] = fileErrors.length > 0 ? [] : records.map((record: Record<string, unknown>, i: number): ImportRow => {
    const raw: RawFields = { product: "", category: "", price: "", description: "", color: "", size: "", stock: "", sku: "" };
    for (const [header, field] of headerMap) raw[field] = cell(record[header]);

    const errors: string[] = [];
    if (!raw.product) errors.push("Falta el nombre del producto.");
    if (!raw.category) errors.push("Falta la categoría.");
    const price: number | null = parseInteger(raw.price);
    if (price === null || price <= 0) errors.push("El precio debe ser un número mayor que cero.");
    if (!raw.color) errors.push("Falta el color.");
    const size: Size | null = parseSize(raw.size);
    if (!size) errors.push(`Talla no válida${raw.size ? ` (“${raw.size}”)` : ""}. Usa ${SIZES.join(", ")}.`);
    const stock: number | null = parseInteger(raw.stock);
    if (stock === null) errors.push("Las existencias deben ser un número entero (0 o más).");

    return {
      line: i + 2,
      product: raw.product,
      category: raw.category,
      price,
      description: raw.description,
      color: raw.color,
      size,
      stock,
      sku: raw.sku,
      errors,
    };
  });

  // Agrupa por producto y detecta inconsistencias entre filas del mismo producto.
  const groups: Map<string, ImportRow[]> = new Map<string, ImportRow[]>();
  for (const row of rows) {
    if (!row.product) continue;
    const key: string = normalize(row.product);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  for (const group of groups.values()) {
    const first: ImportRow = group[0];
    const seen: Set<string> = new Set<string>();
    for (const row of group) {
      if (row.price !== null && first.price !== null && row.price !== first.price) {
        row.errors.push(`El precio no coincide con la fila ${first.line} del mismo producto.`);
      }
      if (normalize(row.category) !== normalize(first.category)) {
        row.errors.push(`La categoría no coincide con la fila ${first.line} del mismo producto.`);
      }
      const combo: string = `${normalize(row.color)}|${row.size}`;
      if (row.size && seen.has(combo)) row.errors.push("Color y talla repetidos en este producto.");
      seen.add(combo);
    }
  }

  const products: ImportProduct[] = [];
  for (const [key, group] of groups) {
    const valid: ImportRow[] = group.filter((r: ImportRow): boolean => r.errors.length === 0);
    if (valid.length === 0) continue;
    const first: ImportRow = valid[0];
    products.push({
      name: first.product,
      category: first.category,
      price: first.price ?? 0,
      description: valid.find((r: ImportRow): boolean => !!r.description)?.description ?? "",
      variants: valid.map(
        (r: ImportRow): ImportVariant => ({ color: r.color, size: r.size as Size, stock: r.stock ?? 0, sku: r.sku }),
      ),
      isUpdate: existingNames.has(key),
      newCategory: !categoryNames.has(normalize(first.category)),
    });
  }

  const validRows: number = rows.filter((r: ImportRow): boolean => r.errors.length === 0).length;
  const variants: ImportVariant[] = products.flatMap((p: ImportProduct): ImportVariant[] => p.variants);

  return {
    rows,
    products,
    fileErrors,
    summary: {
      totalRows: rows.length,
      validRows,
      invalidRows: rows.length - validRows,
      newProducts: products.filter((p: ImportProduct): boolean => !p.isUpdate).length,
      updatedProducts: products.filter((p: ImportProduct): boolean => p.isUpdate).length,
      variants: variants.length,
      units: variants.reduce((sum: number, v: ImportVariant): number => sum + v.stock, 0),
      newCategories: [
        ...new Set<string>(
          products.filter((p: ImportProduct): boolean => p.newCategory).map((p: ImportProduct): string => p.category),
        ),
      ],
    },
  };
}

/** Filas de ejemplo para la plantilla. */
export const TEMPLATE_ROWS: (string | number)[][] = [
  ["Camiseta TKF Negra", "Camisetas", 12000, "Algodón 100% con la llave bordada.", "Negro", "S", 8, "TKF-CAM-NEG-S"],
  ["Camiseta TKF Negra", "Camisetas", 12000, "", "Negro", "M", 12, "TKF-CAM-NEG-M"],
  ["Camiseta TKF Negra", "Camisetas", 12000, "", "Blanco", "M", 10, "TKF-CAM-BLA-M"],
  ["Gorra TKF Malla", "Gorras", 15000, "Gorra con logo bordado y malla trasera.", "Gris", "Única", 9, "TKF-GOR-GRI-U"],
];
