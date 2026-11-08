import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { type CatalogQuery, toSearchParams } from "@/lib/catalog-query";
import { cn } from "@/lib/utils";

type PaginationProps = { query: CatalogQuery; page: number; pageCount: number };

function hrefFor(query: CatalogQuery, page: number): string {
  const qs: string = toSearchParams({ ...query, pagina: page }).toString();
  return qs ? `/tienda?${qs}` : "/tienda";
}

const itemClass: string =
  "flex size-10 items-center justify-center rounded-md text-sm font-medium tabular-nums transition-colors duration-150";

export function Pagination({ query, page, pageCount }: PaginationProps): ReactNode {
  if (pageCount <= 1) return null;
  const pages: number[] = Array.from({ length: pageCount }, (_: unknown, i: number): number => i + 1);

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={hrefFor(query, page - 1)} className={cn(itemClass, "hover:bg-muted")} aria-label="Página anterior">
          <ChevronLeftIcon className="size-4" />
        </Link>
      ) : (
        <span className={cn(itemClass, "opacity-40")} aria-hidden="true">
          <ChevronLeftIcon className="size-4" />
        </span>
      )}
      {pages.map(
        (n: number): ReactNode => (
          <Link
            key={n}
            href={hrefFor(query, n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(itemClass, n === page ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
          >
            {n}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={hrefFor(query, page + 1)} className={cn(itemClass, "hover:bg-muted")} aria-label="Página siguiente">
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <span className={cn(itemClass, "opacity-40")} aria-hidden="true">
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  );
}
