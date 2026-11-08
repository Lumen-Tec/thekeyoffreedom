import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { buttonVariants } from "@/components/ui/button";
import { getAllProducts, getCategories } from "@/lib/catalog";
import type { Category, Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Productos" };

export default async function AdminProductsPage(): Promise<ReactNode> {
  const [products, categories]: [Product[], Category[]] = await Promise.all([getAllProducts(), getCategories()]);

  return (
    <>
      <PageHeader
        title="Productos"
        description="Crea y edita productos, sus variantes de color y talla, y sus existencias."
        actions={
          <Link href="/admin/productos/nuevo" className={cn(buttonVariants(), "h-10 gap-2 px-4")}>
            <PlusIcon />
            Nuevo producto
          </Link>
        }
      />
      <ProductsTable products={products} categories={categories} />
    </>
  );
}
