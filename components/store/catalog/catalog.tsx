import { SearchXIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ActiveFilters } from "@/components/store/catalog/active-filters";
import { CatalogNavProvider, PendingResults } from "@/components/store/catalog/catalog-nav";
import { FilterPanel } from "@/components/store/catalog/filter-panel";
import { MobileFilters } from "@/components/store/catalog/mobile-filters";
import { Pagination } from "@/components/store/catalog/pagination";
import { SearchBox } from "@/components/store/catalog/search-box";
import { SortSelect } from "@/components/store/catalog/sort-select";
import { ProductCard } from "@/components/store/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CatalogQuery, CatalogResult } from "@/lib/catalog-query";
import type { Product } from "@/lib/schemas";

type CatalogProps = { query: CatalogQuery; result: CatalogResult };

export function Catalog({ query, result }: CatalogProps): ReactNode {
  return (
    <CatalogNavProvider query={query}>
      <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <aside aria-label="Filtros" className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel facets={result.facets} />
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:max-w-sm sm:flex-1">
              <SearchBox />
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <MobileFilters facets={result.facets} total={result.total} />
              <SortSelect />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" role="status">
              {result.total === 1 ? "1 producto" : `${result.total} productos`}
            </p>
          </div>
          <ActiveFilters facets={result.facets} />

          <PendingResults>
            {result.items.length === 0 ? (
              <EmptyResults />
            ) : (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                {result.items.map(
                  (product: Product, index: number): ReactNode => (
                    <li key={product.id}>
                      <ProductCard product={product} priority={index < 4} />
                    </li>
                  ),
                )}
              </ul>
            )}
          </PendingResults>

          <div className="pt-6">
            <Pagination query={query} page={result.page} pageCount={result.pageCount} />
          </div>
        </div>
      </div>
    </CatalogNavProvider>
  );
}

function EmptyResults(): ReactNode {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <SearchXIcon className="size-8 text-muted-foreground/70" strokeWidth={1.5} />
      <h2 className="font-medium">No encontramos productos</h2>
      <p className="max-w-sm text-pretty text-sm text-muted-foreground">
        Prueba con otra búsqueda o quita algunos filtros para ver más opciones.
      </p>
    </div>
  );
}

export function CatalogSkeleton(): ReactNode {
  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
      <div className="hidden space-y-6 lg:block">
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
        <Skeleton className="h-28" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-11 sm:max-w-sm" />
        <Skeleton className="h-4 w-24" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from(
            { length: 8 },
            (_: unknown, i: number): ReactNode => (
              <li key={i} className="space-y-3">
                <Skeleton className="aspect-[4/5] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}
