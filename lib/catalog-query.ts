import { z } from "zod";
import { SIZES, type Category, type Color, type Product, type Size, type Variant } from "@/lib/schemas";
import { normalize } from "@/lib/text";

/**
 * Búsqueda, filtros, orden y paginación del catálogo. Todo el estado vive en
 * la URL (`/tienda?q=&cat=&talla=&color=&min=&max=&disponible=&orden=&pagina=`).
 * Son funciones puras: hoy corren sobre la semilla, en producción se traducen
 * a una consulta SQL con los mismos parámetros.
 */

// ── Tipos ────────────────────────────────────────────────────

export const SORTS = {
  recientes: "Más recientes",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  nombre: "Nombre: A–Z",
} as const satisfies Record<string, string>;
export type Sort = keyof typeof SORTS;
const SORT_KEYS: [Sort, ...Sort[]] = Object.keys(SORTS) as [Sort, ...Sort[]];

export const PAGE_SIZE: number = 12;

/** `searchParams` tal como los entrega Next.js. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

export type CatalogQuery = {
  q?: string;
  /** Slugs de categoría. */
  cat: string[];
  talla: Size[];
  /** Nombres de color. */
  color: string[];
  min?: number;
  max?: number;
  /** Solo productos con existencias en la variante filtrada. */
  disponible: boolean;
  orden: Sort;
  pagina: number;
};

export type FacetOption<T extends string = string> = { value: T; label: string; count: number };
export type ColorFacetOption = FacetOption & { hex: string };

export type CatalogFacets = {
  categories: FacetOption[];
  sizes: FacetOption<Size>[];
  colors: ColorFacetOption[];
  price: { min: number; max: number };
};

export type CatalogResult = {
  items: Product[];
  total: number;
  /** Página efectiva (se ajusta si la pedida no existe). */
  page: number;
  pageCount: number;
  facets: CatalogFacets;
};

type Facet = "cat" | "talla" | "color" | "precio";

// ── Lectura de la URL ────────────────────────────────────────

const first = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value);

/** Acepta `?x=a,b` y `?x=a&x=b`. */
const listSchema: z.ZodType<string[]> = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value: string | string[] | undefined): string[] =>
    value === undefined
      ? []
      : (Array.isArray(value) ? value : [value]).flatMap((s: string): string[] => s.split(",")).filter(Boolean),
  );

const isSize = (value: string): value is Size => (SIZES as readonly string[]).includes(value);

const optionalIntSchema: z.ZodType<number | undefined> = z.preprocess(
  (value: unknown): number | undefined => {
    const raw: unknown = first(value);
    return raw === undefined || raw === "" ? undefined : Number(raw);
  },
  z.int().nonnegative().optional().catch(undefined),
);

export const catalogQuerySchema: z.ZodType<CatalogQuery> = z.object({
  q: z.preprocess(first, z.string().trim().max(100).optional().catch(undefined)),
  cat: listSchema,
  talla: listSchema.transform((values: string[]): Size[] => values.filter(isSize)),
  color: listSchema,
  min: optionalIntSchema,
  max: optionalIntSchema,
  disponible: z
    .preprocess(first, z.literal("1").optional().catch(undefined))
    .transform((value: "1" | undefined): boolean => value === "1"),
  orden: z.preprocess(first, z.enum(SORT_KEYS).catch("recientes")),
  pagina: z.preprocess((value: unknown): number => Number(first(value) ?? 1), z.int().positive().catch(1)),
});

/** Nunca falla: los valores inválidos caen a su valor por defecto. */
export const parseCatalogQuery = (params: RawSearchParams): CatalogQuery => catalogQuerySchema.parse(params);

/** Serializa una consulta a `URLSearchParams`, omitiendo valores por defecto. */
export function toSearchParams(query: Partial<CatalogQuery>): URLSearchParams {
  const sp: URLSearchParams = new URLSearchParams();
  if (query.q) sp.set("q", query.q);
  if (query.cat?.length) sp.set("cat", query.cat.join(","));
  if (query.talla?.length) sp.set("talla", query.talla.join(","));
  if (query.color?.length) sp.set("color", query.color.join(","));
  if (query.min !== undefined) sp.set("min", String(query.min));
  if (query.max !== undefined) sp.set("max", String(query.max));
  if (query.disponible) sp.set("disponible", "1");
  if (query.orden && query.orden !== "recientes") sp.set("orden", query.orden);
  if (query.pagina && query.pagina > 1) sp.set("pagina", String(query.pagina));
  return sp;
}

// ── Búsqueda y filtros ───────────────────────────────────────


/**
 * Raíz mínima para que plural y género no importen al buscar:
 * "camisas" → "camis" (encuentra "camiseta"), "negra" → "negr" (encuentra "negro").
 */
const stem = (term: string): string => {
  let result: string = term.length > 3 ? term.replace(/s$/, "") : term;
  if (result.length > 3) result = result.replace(/[aoe]$/, "");
  return result;
};

/**
 * ¿El producto cumple la consulta? `skip` ignora un filtro, para calcular
 * los conteos de esa faceta como si no estuviera aplicado.
 */
function matches(product: Product, query: CatalogQuery, categories: Map<string, Category>, skip?: Facet): boolean {
  const category: Category | undefined = categories.get(product.categoryId);

  if (query.q) {
    const haystack: string = normalize(
      [product.name, product.description, category?.name ?? "", ...product.variants.map((v: Variant): string => v.color.name)].join(" "),
    );
    const terms: string[] = normalize(query.q).split(/\s+/).filter(Boolean).map(stem);
    if (!terms.every((term: string): boolean => haystack.includes(term))) return false;
  }

  if (skip !== "cat" && query.cat.length && !(category && query.cat.includes(category.slug))) return false;

  if (skip !== "precio") {
    if (query.min !== undefined && product.price < query.min) return false;
    if (query.max !== undefined && product.price > query.max) return false;
  }

  // Talla, color y disponibilidad se evalúan juntos sobre la misma variante:
  // "M en negro disponible" exige una variante que cumpla las tres cosas.
  const sizes: Size[] = skip === "talla" ? [] : query.talla;
  const colors: string[] = skip === "color" ? [] : query.color;
  if (sizes.length || colors.length || query.disponible) {
    const hasMatchingVariant: boolean = product.variants.some(
      (v: Variant): boolean =>
        (!sizes.length || sizes.includes(v.size)) &&
        (!colors.length || colors.includes(v.color.name)) &&
        (!query.disponible || v.stock > 0),
    );
    if (!hasMatchingVariant) return false;
  }

  return true;
}

type Comparator = (a: Product, b: Product) => number;

const SORTERS: Record<Sort, Comparator> = {
  recientes: (a: Product, b: Product): number => b.createdAt.localeCompare(a.createdAt),
  "precio-asc": (a: Product, b: Product): number => a.price - b.price || a.name.localeCompare(b.name, "es"),
  "precio-desc": (a: Product, b: Product): number => b.price - a.price || a.name.localeCompare(b.name, "es"),
  nombre: (a: Product, b: Product): number => a.name.localeCompare(b.name, "es"),
};

const hasVariant =
  (predicate: (v: Variant) => boolean) =>
  (product: Product): boolean =>
    product.variants.some(predicate);

export function runCatalogQuery(products: Product[], categoryList: Category[], query: CatalogQuery): CatalogResult {
  const categories: Map<string, Category> = new Map(categoryList.map((c: Category): [string, Category] => [c.id, c]));
  const active: Product[] = products.filter((p: Product): boolean => p.active);

  const filtered: Product[] = active
    .filter((p: Product): boolean => matches(p, query, categories))
    .sort(SORTERS[query.orden]);
  const pageCount: number = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page: number = Math.min(query.pagina, pageCount);

  // Conteos por faceta, con el resto de filtros aplicados.
  const without = (facet: Facet): Product[] => active.filter((p: Product): boolean => matches(p, query, categories, facet));

  const byCategory: Product[] = without("cat");
  const categoryFacet: FacetOption[] = [...categoryList]
    .sort((a: Category, b: Category): number => a.position - b.position)
    .map(
      (c: Category): FacetOption => ({
        value: c.slug,
        label: c.name,
        count: byCategory.filter((p: Product): boolean => p.categoryId === c.id).length,
      }),
    );

  const bySize: Product[] = without("talla");
  const sizeFacet: FacetOption<Size>[] = SIZES.filter((s: Size): boolean =>
    active.some(hasVariant((v: Variant): boolean => v.size === s)),
  ).map(
    (s: Size): FacetOption<Size> => ({
      value: s,
      label: s,
      count: bySize.filter(hasVariant((v: Variant): boolean => v.size === s)).length,
    }),
  );

  const byColor: Product[] = without("color");
  const allColors: Map<string, Color> = new Map<string, Color>();
  for (const p of active) for (const v of p.variants) allColors.set(v.color.name, v.color);
  const colorFacet: ColorFacetOption[] = [...allColors.values()]
    .map(
      (c: Color): ColorFacetOption => ({
        value: c.name,
        label: c.name,
        hex: c.hex,
        count: byColor.filter(hasVariant((v: Variant): boolean => v.color.name === c.name)).length,
      }),
    )
    .sort((a: ColorFacetOption, b: ColorFacetOption): number => a.label.localeCompare(b.label, "es"));

  const prices: number[] = active.map((p: Product): number => p.price);

  return {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: filtered.length,
    page,
    pageCount,
    facets: {
      categories: categoryFacet,
      sizes: sizeFacet,
      colors: colorFacet,
      price: { min: Math.min(...prices), max: Math.max(...prices) },
    },
  };
}
