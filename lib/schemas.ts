import { z } from "zod";

/**
 * Modelo del catálogo. Los tipos se declaran explícitamente y cada esquema
 * de Zod se anota con el tipo que valida (`z.ZodType<T>`), así el compilador
 * avisa si el esquema y el tipo se desalinean. En producción, estos tipos
 * guían las tablas de Drizzle y la validación de la API (Hono).
 */

// ── Tipos ────────────────────────────────────────────────────

/** Tallas en el orden en que se muestran. "Única" es para gorras y similares. */
export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "Única"] as const;
export type Size = (typeof SIZES)[number];

export type Color = {
  name: string;
  /** `#RRGGBB` */
  hex: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  position: number;
};

export type ProductImage = {
  /** Ruta absoluta dentro de `public/`, p. ej. `/products/x.webp`. */
  src: string;
  alt: string;
  /** Si se indica, la imagen pertenece a ese color (por nombre). */
  color?: string;
};

export type Variant = {
  id: string;
  sku: string;
  color: Color;
  size: Size;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  /** Colones enteros, IVA incluido. */
  price: number;
  active: boolean;
  featured: boolean;
  /** `YYYY-MM-DD`, para ordenar por "Más recientes". */
  createdAt: string;
  images: ProductImage[];
  variants: Variant[];
};

export type Catalog = {
  categories: Category[];
  products: Product[];
};

// ── Esquemas ─────────────────────────────────────────────────

const slugSchema: z.ZodType<string> = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido");
const hexSchema: z.ZodType<string> = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hex inválido");

export const sizeSchema: z.ZodType<Size> = z.enum(SIZES);

export const colorSchema: z.ZodType<Color> = z.object({
  name: z.string().min(1),
  hex: hexSchema,
});

export const categorySchema: z.ZodType<Category> = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  position: z.int().nonnegative(),
});

export const productImageSchema: z.ZodType<ProductImage> = z.object({
  src: z.string().startsWith("/"),
  alt: z.string().min(1),
  color: z.string().optional(),
});

export const variantSchema: z.ZodType<Variant> = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  color: colorSchema,
  size: sizeSchema,
  stock: z.int().nonnegative(),
});

/** Sin variantes color/talla repetidas y sin imágenes de colores inexistentes. */
function refineProduct(product: Product, ctx: z.core.$RefinementCtx<Product>): void {
  const combos: Set<string> = new Set<string>();
  for (const variant of product.variants) {
    const key: string = `${variant.color.name}/${variant.size}`;
    if (combos.has(key)) {
      ctx.addIssue({ code: "custom", message: `Variante duplicada: ${key}`, path: ["variants"] });
    }
    combos.add(key);
  }

  const colors: Set<string> = new Set<string>(product.variants.map((variant: Variant): string => variant.color.name));
  for (const image of product.images) {
    if (image.color && !colors.has(image.color)) {
      ctx.addIssue({ code: "custom", message: `Imagen con color sin variante: ${image.color}`, path: ["images"] });
    }
  }
}

export const productSchema: z.ZodType<Product> = z
  .object({
    id: z.string().min(1),
    slug: slugSchema,
    name: z.string().min(1),
    description: z.string().min(1),
    categoryId: z.string().min(1),
    price: z.int().positive(),
    active: z.boolean(),
    featured: z.boolean(),
    createdAt: z.iso.date(),
    images: z.array(productImageSchema).min(1),
    variants: z.array(variantSchema).min(1),
  })
  .superRefine(refineProduct);

/** Categorías existentes y slugs/SKU únicos en todo el catálogo. */
function refineCatalog(catalog: Catalog, ctx: z.core.$RefinementCtx<Catalog>): void {
  const categoryIds: Set<string> = new Set<string>(catalog.categories.map((category: Category): string => category.id));
  const slugs: Set<string> = new Set<string>();
  const skus: Set<string> = new Set<string>();

  for (const product of catalog.products) {
    if (!categoryIds.has(product.categoryId)) {
      ctx.addIssue({ code: "custom", message: `${product.slug}: categoría inexistente ${product.categoryId}` });
    }
    if (slugs.has(product.slug)) {
      ctx.addIssue({ code: "custom", message: `Slug duplicado: ${product.slug}` });
    }
    slugs.add(product.slug);

    for (const variant of product.variants) {
      if (skus.has(variant.sku)) {
        ctx.addIssue({ code: "custom", message: `SKU duplicado: ${variant.sku}` });
      }
      skus.add(variant.sku);
    }
  }
}

export const catalogSchema: z.ZodType<Catalog> = z
  .object({
    categories: z.array(categorySchema),
    products: z.array(productSchema),
  })
  .superRefine(refineCatalog);
