import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Marcador del detalle de producto con la misma estructura que la página real. */
export function ProductDetailSkeleton(): ReactNode {
  return (
    <div aria-busy="true" aria-label="Cargando producto">
      <Skeleton className="mb-6 h-5 w-28" />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="space-y-3">
          <Skeleton className="aspect-[4/5] rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="size-20 rounded-md" />
            <Skeleton className="size-20 rounded-md" />
          </div>
        </div>
        <div className="flex flex-col gap-7">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="size-11 rounded-full" />
          </div>
          <div className="flex gap-2">
            {Array.from(
              { length: 4 },
              (_: unknown, i: number): ReactNode => (
                <Skeleton key={i} className="h-11 w-14 rounded-md" />
              ),
            )}
          </div>
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
