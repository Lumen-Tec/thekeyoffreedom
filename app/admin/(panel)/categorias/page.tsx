import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CategoriesManager, type CategoryRow } from "@/components/admin/categories-manager";
import { PageHeader } from "@/components/admin/page-header";
import { getAllProducts, getCategories } from "@/lib/catalog";
import type { Category, Product } from "@/lib/schemas";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriesPage(): Promise<ReactNode> {
  const [categories, products]: [Category[], Product[]] = await Promise.all([getCategories(), getAllProducts()]);
  const rows: CategoryRow[] = categories.map(
    (c: Category): CategoryRow => ({
      id: c.id,
      name: c.name,
      productCount: products.filter((p: Product): boolean => p.categoryId === c.id).length,
    }),
  );

  return (
    <>
      <PageHeader title="Categorías" description="Organiza el catálogo. El orden aquí es el orden en la tienda." />
      <CategoriesManager initial={rows} />
    </>
  );
}
