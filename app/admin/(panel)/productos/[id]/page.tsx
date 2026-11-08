import type { Metadata } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { ProductEditor } from "@/components/admin/product-editor/product-editor";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllProducts, getCategories } from "@/lib/catalog";
import type { Category, Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type IdParams = { id: string };

export const metadata: Metadata = { title: "Editar producto" };

export async function generateStaticParams(): Promise<IdParams[]> {
  const products: Product[] = await getAllProducts();
  return products.map((p: Product): IdParams => ({ id: p.id }));
}

/** Los datos de la URL se leen dentro del `<Suspense>` (navegación instantánea). */
export default function EditProductPage({ params }: PageProps<"/admin/productos/[id]">): ReactNode {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditorContent params={params} />
    </Suspense>
  );
}

async function EditorContent({ params }: Pick<PageProps<"/admin/productos/[id]">, "params">): Promise<ReactNode> {
  const { id }: IdParams = await params;
  const [products, categories]: [Product[], Category[]] = await Promise.all([getAllProducts(), getCategories()]);
  const product: Product | undefined = products.find((p: Product): boolean => p.id === id);

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <h1 className="text-xl font-semibold">No encontramos este producto</h1>
        <p className="text-sm text-muted-foreground">Puede que se haya eliminado.</p>
        <Link href="/admin/productos" className={cn(buttonVariants({ variant: "outline" }), "mt-2 h-10 px-4")}>
          Volver a productos
        </Link>
      </div>
    );
  }

  return <ProductEditor product={product} categories={categories} />;
}

function EditorSkeleton(): ReactNode {
  return (
    <div aria-busy="true" aria-label="Cargando producto">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-8 h-8 w-72" />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
