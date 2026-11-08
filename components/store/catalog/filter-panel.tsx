"use client";

import { CheckIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type CatalogNav, useCatalogNav } from "@/components/store/catalog/catalog-nav";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCRC } from "@/lib/availability";
import { useOnHide } from "@/lib/use-navigation-reset";
import type { CatalogFacets, CatalogQuery, ColorFacetOption, FacetOption } from "@/lib/catalog-query";
import type { Size } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type FilterPanelProps = { facets: CatalogFacets };

/** Cantidad de filtros activos (sin contar búsqueda ni orden). */
export function activeFilterCount(query: CatalogQuery): number {
  return (
    query.cat.length +
    query.talla.length +
    query.color.length +
    (query.min !== undefined || query.max !== undefined ? 1 : 0) +
    (query.disponible ? 1 : 0)
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v: T): boolean => v !== value) : [...list, value];
}

export function FilterPanel({ facets }: FilterPanelProps): ReactNode {
  const { query, update, clearFilters }: CatalogNav = useCatalogNav();
  const count: number = activeFilterCount(query);

  return (
    <div className="flex flex-col gap-8">
      <FilterSection title="Categoría">
        <ul className="space-y-1">
          {facets.categories.map((option: FacetOption): ReactNode => {
            const id: string = `cat-${option.value}`;
            const checked: boolean = query.cat.includes(option.value);
            return (
              <li key={option.value}>
                <Label
                  htmlFor={id}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center gap-3 rounded-md text-sm font-normal",
                    option.count === 0 && !checked && "text-muted-foreground",
                  )}
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(): void => update({ cat: toggle(query.cat, option.value) })}
                  />
                  <span className="flex-1">{option.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{option.count}</span>
                </Label>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Talla">
        <ul className="flex flex-wrap gap-2">
          {facets.sizes.map((option: FacetOption<Size>): ReactNode => {
            const selected: boolean = query.talla.includes(option.value);
            const disabled: boolean = option.count === 0 && !selected;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={(): void => update({ talla: toggle(query.talla, option.value) })}
                  className={cn(
                    "h-10 min-w-12 rounded-md border px-3 text-sm font-medium transition-colors duration-150",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-input/20 hover:bg-input/50",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Color">
        <ul className="grid grid-cols-6 gap-2 lg:grid-cols-5">
          {facets.colors.map((option: ColorFacetOption): ReactNode => {
            const selected: boolean = query.color.includes(option.value);
            const disabled: boolean = option.count === 0 && !selected;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  title={option.label}
                  onClick={(): void => update({ color: toggle(query.color, option.value) })}
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-full border border-white/15 transition-[box-shadow] duration-150",
                    selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    disabled && "cursor-not-allowed opacity-30",
                  )}
                  style={{ backgroundColor: option.hex }}
                >
                  {selected && <CheckIcon className="size-4 text-white mix-blend-difference" />}
                  <span className="sr-only">
                    {option.label} ({option.count})
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      {facets.price.min < facets.price.max && <PriceFilter facets={facets} />}

      <FilterSection title="Disponibilidad">
        <Label htmlFor="solo-disponibles" className="flex min-h-10 cursor-pointer items-center gap-3 text-sm font-normal">
          <Checkbox
            id="solo-disponibles"
            checked={query.disponible}
            onCheckedChange={(checked: boolean): void => update({ disponible: checked })}
          />
          Solo con existencias
        </Label>
      </FilterSection>

      {count > 0 && (
        <Button variant="outline" className="h-10" onClick={clearFilters}>
          Limpiar filtros ({count})
        </Button>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }): ReactNode {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

const PRICE_STEP: number = 500;

function PriceFilter({ facets }: FilterPanelProps): ReactNode {
  const { query, update }: CatalogNav = useCatalogNav();
  const min: number = facets.price.min;
  const max: number = facets.price.max;
  const current: [number, number] = [query.min ?? min, query.max ?? max];
  const [draft, setDraft] = useState<[number, number] | null>(null);
  const shown: [number, number] = draft ?? current;
  // Un arrastre a medias no debe quedar pegado al volver a la tienda.
  useOnHide((): void => setDraft(null));

  return (
    <FilterSection title="Precio">
      <Slider
        min={min}
        max={max}
        step={PRICE_STEP}
        value={shown}
        aria-label="Rango de precio"
        onValueChange={(value: number | readonly number[]): void => {
          if (Array.isArray(value)) setDraft([value[0], value[1]]);
        }}
        onValueCommitted={(value: number | readonly number[]): void => {
          setDraft(null);
          if (!Array.isArray(value)) return;
          const [low, high]: number[] = value;
          update({ min: low > min ? low : undefined, max: high < max ? high : undefined });
        }}
        className="mt-2"
      />
      <p className="mt-3 flex justify-between text-sm tabular-nums text-muted-foreground">
        <span>{formatCRC(shown[0])}</span>
        <span>{formatCRC(shown[1])}</span>
      </p>
    </FilterSection>
  );
}
