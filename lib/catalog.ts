import { cacheLife } from "next/cache";
import { seed } from "@/data/seed";
import { runCatalogQuery, type CatalogQuery, type CatalogResult } from "@/lib/catalog-query";
import { catalogSchema, type Catalog, type Category, type Product } from "@/lib/schemas";

/**
 * Capa de acceso a datos del catálogo. Las páginas solo usan estas funciones;
 * al pasar a producción se reemplaza su interior por consultas a Supabase
 * (Drizzle) sin tocar los componentes.
 */

let validated: Catalog | undefined;

/** Valida la semilla una sola vez; un error aquí rompe el build a propósito. */
function catalog(): Catalog {
  validated ??= catalogSchema.parse(seed);
  return validated;
}

const isActive = (product: Product): boolean => product.active;

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("max");
  return [...catalog().categories].sort((a: Category, b: Category): number => a.position - b.position);
}

export async function getProducts(query: CatalogQuery): Promise<CatalogResult> {
  "use cache";
  cacheLife("max");
  const { products, categories }: Catalog = catalog();
  return runCatalogQuery(products, categories, query);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("max");
  return catalog().products.find((p: Product): boolean => p.slug === slug && p.active) ?? null;
}

export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("max");
  return catalog()
    .products.filter(isActive)
    .map((p: Product): string => p.slug);
}

export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  "use cache";
  cacheLife("max");
  return catalog()
    .products.filter((p: Product): boolean => p.active && p.featured)
    .slice(0, limit);
}

/** Productos de la misma categoría, para "También te puede gustar". */
export async function getRelatedProducts(product: Product, limit: number = 4): Promise<Product[]> {
  "use cache";
  cacheLife("max");
  return catalog()
    .products.filter((p: Product): boolean => p.active && p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, limit);
}

/** Todos los productos (activos u ocultos), para el panel. */
export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("max");
  return catalog().products;
}
