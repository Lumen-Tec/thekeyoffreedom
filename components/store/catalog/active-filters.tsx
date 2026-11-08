"use client";

import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { type CatalogNav, useCatalogNav } from "@/components/store/catalog/catalog-nav";
import { formatCRC } from "@/lib/availability";
import type { CatalogFacets, CatalogQuery, FacetOption } from "@/lib/catalog-query";
import type { Size } from "@/lib/schemas";

type Chip = { key: string; label: string; remove: Partial<CatalogQuery> };

/** Etiquetas removibles de los filtros aplicados. */
export function ActiveFilters({ facets }: { facets: CatalogFacets }): ReactNode {
  const { query, update, clearFilters }: CatalogNav = useCatalogNav();

  const categoryLabel = (slug: string): string =>
    facets.categories.find((c: FacetOption): boolean => c.value === slug)?.label ?? slug;

  const chips: Chip[] = [
    ...query.cat.map(
      (slug: string): Chip => ({
        key: `cat-${slug}`,
        label: categoryLabel(slug),
        remove: { cat: query.cat.filter((c: string): boolean => c !== slug) },
      }),
    ),
    ...query.talla.map(
      (size: Size): Chip => ({
        key: `talla-${size}`,
        label: size === "Única" ? "Talla única" : `Talla ${size}`,
        remove: { talla: query.talla.filter((s: Size): boolean => s !== size) },
      }),
    ),
    ...query.color.map(
      (color: string): Chip => ({
        key: `color-${color}`,
        label: color,
        remove: { color: query.color.filter((c: string): boolean => c !== color) },
      }),
    ),
  ];
  if (query.min !== undefined || query.max !== undefined) {
    chips.push({
      key: "precio",
      label: `${formatCRC(query.min ?? facets.price.min)} – ${formatCRC(query.max ?? facets.price.max)}`,
      remove: { min: undefined, max: undefined },
    });
  }
  if (query.disponible) chips.push({ key: "disp", label: "Con existencias", remove: { disponible: false } });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(
        (chip: Chip): ReactNode => (
          <button
            key={chip.key}
            type="button"
            onClick={(): void => update(chip.remove)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-input bg-input/20 pr-2 pl-3 text-sm transition-colors duration-150 hover:bg-input/50"
          >
            {chip.label}
            <XIcon className="size-3.5 text-muted-foreground" />
            <span className="sr-only">Quitar filtro</span>
          </button>
        ),
      )}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearFilters}
          className="h-8 px-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Limpiar todo
        </button>
      )}
    </div>
  );
}
