"use client";

import type { ReactNode } from "react";
import { type CatalogNav, useCatalogNav } from "@/components/store/catalog/catalog-nav";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SORTS, type Sort } from "@/lib/catalog-query";

type SortItem = { value: Sort; label: string };

const ITEMS: SortItem[] = (Object.entries(SORTS) as [Sort, string][]).map(
  ([value, label]: [Sort, string]): SortItem => ({ value, label }),
);

export function SortSelect(): ReactNode {
  const { query, update }: CatalogNav = useCatalogNav();

  return (
    <Select
      items={ITEMS}
      value={query.orden}
      onValueChange={(value: Sort | null): void => {
        if (value) update({ orden: value });
      }}
    >
      <SelectTrigger aria-label="Ordenar por" className="min-w-48 data-[size=default]:h-11">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {ITEMS.map(
          (item: SortItem): ReactNode => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}
