"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, type ReactNode, type TransitionStartFunction, useContext, useTransition } from "react";
import { type CatalogQuery, toSearchParams } from "@/lib/catalog-query";
import { cn } from "@/lib/utils";

/**
 * Comparte la consulta actual y una función para cambiarla. Cada cambio
 * reemplaza la URL dentro de una transición, así los resultados se
 * atenúan mientras llegan los nuevos (sin desmontar la página).
 */

export type CatalogNav = {
  query: CatalogQuery;
  pending: boolean;
  /** Aplica cambios a la consulta. Vuelve a la página 1 salvo que se indique otra. */
  update: (changes: Partial<CatalogQuery>) => void;
  /** Limpia todos los filtros, conservando la búsqueda y el orden. */
  clearFilters: () => void;
};

const CatalogNavContext: React.Context<CatalogNav | null> = createContext<CatalogNav | null>(null);

export function useCatalogNav(): CatalogNav {
  const ctx: CatalogNav | null = useContext(CatalogNavContext);
  if (!ctx) throw new Error("useCatalogNav debe usarse dentro de <CatalogNavProvider>");
  return ctx;
}

type ProviderProps = { query: CatalogQuery; children: ReactNode };

export function CatalogNavProvider({ query, children }: ProviderProps): ReactNode {
  const router: ReturnType<typeof useRouter> = useRouter();
  const pathname: string = usePathname();
  const [pending, startTransition]: [boolean, TransitionStartFunction] = useTransition();

  const navigate = (next: Partial<CatalogQuery>): void => {
    const qs: string = toSearchParams(next).toString();
    startTransition((): void => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const value: CatalogNav = {
    query,
    pending,
    update: (changes: Partial<CatalogQuery>): void => navigate({ ...query, pagina: 1, ...changes }),
    clearFilters: (): void => navigate({ q: query.q, orden: query.orden }),
  };

  return <CatalogNavContext.Provider value={value}>{children}</CatalogNavContext.Provider>;
}

/** Atenúa los resultados mientras se cargan los de la nueva consulta. */
export function PendingResults({ children }: { children: ReactNode }): ReactNode {
  const { pending }: CatalogNav = useCatalogNav();
  return (
    <div
      aria-busy={pending}
      className={cn("transition-opacity duration-150", pending && "pointer-events-none opacity-50")}
    >
      {children}
    </div>
  );
}
