import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ImportWizard } from "@/components/admin/import-wizard";
import { PageHeader } from "@/components/admin/page-header";
import { getAllProducts, getCategories } from "@/lib/catalog";
import type { Category, Product } from "@/lib/schemas";

export const metadata: Metadata = { title: "Importar productos" };

export default async function ImportPage(): Promise<ReactNode> {
  const [categories, products]: [Category[], Product[]] = await Promise.all([getCategories(), getAllProducts()]);
  return (
    <>
      <PageHeader
        title="Importar productos"
        description="Carga tu inventario desde Excel o CSV. Revisa la vista previa antes de confirmar."
      />
      <ImportWizard categories={categories} products={products} />
    </>
  );
}
