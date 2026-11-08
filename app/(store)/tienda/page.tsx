import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/store/catalog/catalog";
import { getProducts } from "@/lib/catalog";
import { type CatalogQuery, type CatalogResult, parseCatalogQuery, type RawSearchParams } from "@/lib/catalog-query";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Camisetas, blusas y gorras de The Key of Freedom. Algodón 100% con la llave bordada.",
};

export default function StorePage({ searchParams }: PageProps<"/tienda">): ReactNode {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Colección</p>
        <h1 className="mt-2 font-heading text-4xl sm:text-5xl">Tienda</h1>
      </header>
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CatalogResults({ searchParams }: { searchParams: Promise<RawSearchParams> }): Promise<ReactNode> {
  const query: CatalogQuery = parseCatalogQuery(await searchParams);
  const result: CatalogResult = await getProducts(query);
  return <Catalog query={query} result={result} />;
}
