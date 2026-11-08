import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProductEditor } from "@/components/admin/product-editor/product-editor";
import { getCategories } from "@/lib/catalog";
import type { Category } from "@/lib/schemas";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage(): Promise<ReactNode> {
  const categories: Category[] = await getCategories();
  return <ProductEditor categories={categories} />;
}
