"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type CatalogNav, useCatalogNav } from "@/components/store/catalog/catalog-nav";
import { activeFilterCount, FilterPanel } from "@/components/store/catalog/filter-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CatalogFacets } from "@/lib/catalog-query";
import { useOnHide } from "@/lib/use-navigation-reset";

type MobileFiltersProps = { facets: CatalogFacets; total: number };

export function MobileFilters({ facets, total }: MobileFiltersProps): ReactNode {
  const [open, setOpen] = useState<boolean>(false);
  useOnHide((): void => setOpen(false));
  const { query, pending }: CatalogNav = useCatalogNav();
  const count: number = activeFilterCount(query);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" className="h-11 gap-2 px-4 lg:hidden" />}>
        <SlidersHorizontalIcon />
        Filtros
        {count > 0 && (
          <span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums">
            {count}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[88%] max-w-sm gap-0">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle className="text-base">Filtros</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          <FilterPanel facets={facets} />
        </div>
        <SheetFooter className="border-t border-border/60">
          <Button className="h-11 text-base" onClick={(): void => setOpen(false)} disabled={pending}>
            {pending ? "Actualizando…" : `Ver ${total} ${total === 1 ? "resultado" : "resultados"}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
