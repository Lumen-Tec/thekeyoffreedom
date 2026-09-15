import { usePagination } from "react-instantsearch";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PaginationControls({ onPageChange }: { onPageChange: () => void }) {
  const { currentRefinement, nbPages, isFirstPage, isLastPage, refine, canRefine } = usePagination();

  function changePage(page: number) {
    if (page === currentRefinement) return;

    refine(page);
    onPageChange();
  }

  if (!canRefine) {
    return null;
  }

  const visiblePageCount = Math.min(5, nbPages);
  const firstVisiblePage = Math.min(
    Math.max(currentRefinement - Math.floor(visiblePageCount / 2), 0),
    nbPages - visiblePageCount,
  );
  const visiblePages = Array.from(
    { length: visiblePageCount },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <Pagination aria-label="Paginación de productos" className="shrink-0 items-center border-b border-[#E8B94B]/25 bg-[#14110F] px-2 py-2 text-[#EDE6D6] [&_a]:h-11 [&_a]:min-w-9 [&_a]:rounded-none [&_a]:border-transparent [&_a]:text-[#EDE6D6] [&_a:hover]:bg-[#E8B94B]/15 [&_a:focus-visible]:ring-[#E8B94B] [&_a[aria-current=page]]:bg-[#E8B94B] [&_a[aria-current=page]]:text-[#14110F]">
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text="Anterior"
            aria-label="Página anterior"
            tabIndex={isFirstPage ? -1 : undefined}
            aria-disabled={isFirstPage}
            className={isFirstPage ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (!isFirstPage) changePage(currentRefinement - 1);
            }}
          />
        </PaginationItem>

        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              aria-label={`Página ${page + 1}`}
              isActive={page === currentRefinement}
              onClick={(e) => {
                e.preventDefault();
                changePage(page);
              }}
            >
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            text="Siguiente"
            aria-label="Página siguiente"
            tabIndex={isLastPage ? -1 : undefined}
            aria-disabled={isLastPage}
            className={isLastPage ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (!isLastPage) changePage(currentRefinement + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
