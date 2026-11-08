import { SIZES, type Color, type Product, type ProductImage, type Size } from "@/lib/schemas";

/** Estado del formulario del editor. Los números se editan como texto. */
export type EditorState = {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  active: boolean;
  featured: boolean;
  colors: Color[];
  sizes: Size[];
  /** Existencias por combinación, clave `color|talla`. */
  stock: Record<string, string>;
};

export type EditorImage = ProductImage & {
  /** Identificador estable para listas. */
  id: string;
  /** Subida en esta sesión (vista previa local, no se guarda). */
  local?: boolean;
};

export type EditorErrors = Partial<Record<"name" | "description" | "categoryId" | "price" | "colors" | "sizes" | "stock" | "images", string>>;

export const stockKey = (color: string, size: string): string => `${color}|${size}`;

export function stateFromProduct(product?: Product): EditorState {
  if (!product) {
    return {
      name: "",
      description: "",
      categoryId: "",
      price: "",
      active: true,
      featured: false,
      colors: [],
      sizes: ["S", "M", "L", "XL"],
      stock: {},
    };
  }

  const colors: Map<string, Color> = new Map<string, Color>();
  const sizes: Set<Size> = new Set<Size>();
  const stock: Record<string, string> = {};
  for (const v of product.variants) {
    colors.set(v.color.name, v.color);
    sizes.add(v.size);
    stock[stockKey(v.color.name, v.size)] = String(v.stock);
  }

  return {
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    price: String(product.price),
    active: product.active,
    featured: product.featured,
    colors: [...colors.values()],
    sizes: SIZES.filter((s: Size): boolean => sizes.has(s)),
    stock,
  };
}

export function imagesFromProduct(product?: Product): EditorImage[] {
  return (product?.images ?? []).map(
    (img: ProductImage, i: number): EditorImage => ({ ...img, id: `${img.src}-${i}` }),
  );
}

/** Valida el formulario; devuelve un mensaje por campo con problemas. */
export function validateEditor(state: EditorState, images: EditorImage[]): EditorErrors {
  const errors: EditorErrors = {};

  if (state.name.trim().length < 3) errors.name = "Escribe un nombre de al menos 3 caracteres.";
  if (state.description.trim().length < 10) errors.description = "Agrega una descripción de al menos 10 caracteres.";
  if (!state.categoryId) errors.categoryId = "Elige una categoría.";

  const price: number = Number(state.price);
  if (!state.price || !Number.isInteger(price) || price <= 0) errors.price = "Escribe un precio mayor que cero.";

  if (state.colors.length === 0) errors.colors = "Agrega al menos un color.";
  if (state.sizes.length === 0) errors.sizes = "Elige al menos una talla.";

  const invalidStock: boolean = state.colors.some((c: Color): boolean =>
    state.sizes.some((s: Size): boolean => {
      const raw: string = state.stock[stockKey(c.name, s)] ?? "0";
      const n: number = Number(raw === "" ? "0" : raw);
      return !Number.isInteger(n) || n < 0;
    }),
  );
  if (invalidStock) errors.stock = "Las existencias deben ser números enteros, sin negativos.";

  if (images.length === 0) errors.images = "Agrega al menos una imagen.";

  return errors;
}
