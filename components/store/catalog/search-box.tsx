"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { type CatalogNav, useCatalogNav } from "@/components/store/catalog/catalog-nav";
import { Input } from "@/components/ui/input";
import { useOnHide } from "@/lib/use-navigation-reset";

const DEBOUNCE_MS: number = 300;

export function SearchBox(): ReactNode {
  const { query, update }: CatalogNav = useCatalogNav();
  const [value, setValue] = useState<string>(query.q ?? "");
  const timer: React.RefObject<ReturnType<typeof setTimeout> | undefined> = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** Última búsqueda enviada desde este campo. */
  const sent: React.RefObject<string> = useRef<string>(query.q ?? "");

  // Si la búsqueda de la URL cambia por otro motivo (p. ej. un enlace del
  // menú), la refleja; las que envió este mismo campo se ignoran para no
  // pisar lo que la persona sigue escribiendo.
  useEffect((): void => {
    const external: string = query.q ?? "";
    if (external === sent.current) return;
    sent.current = external;
    setValue(external);
  }, [query.q]);

  // Si la página se oculta (p. ej. clic en un producto) con una búsqueda
  // pendiente, se cancela: si no, el temporizador regresaría a /tienda.
  useOnHide((): void => clearTimeout(timer.current));

  const commit = (next: string): void => {
    clearTimeout(timer.current);
    timer.current = setTimeout((): void => {
      sent.current = next.trim();
      update({ q: sent.current || undefined });
    }, DEBOUNCE_MS);
  };

  return (
    <div className="relative w-full">
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        aria-label="Buscar productos"
        placeholder="Buscar camisetas, gorras, colores…"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>): void => {
          setValue(e.target.value);
          commit(e.target.value);
        }}
        className="h-11 pr-10 pl-9 text-base sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={(): void => {
            setValue("");
            clearTimeout(timer.current);
            sent.current = "";
            update({ q: undefined });
          }}
          className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <XIcon className="size-4" />
          <span className="sr-only">Borrar búsqueda</span>
        </button>
      )}
    </div>
  );
}
