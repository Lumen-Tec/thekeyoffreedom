"use client";

import { useCallback, useRef } from "react";
import { useClearRefinements, useStats } from "react-instantsearch";
import { Button } from "@/components/ui/button";
import { HitsPerPageSelect } from "./HitsPerPageSelect";
import { PaginationControls } from "./PaginationControls";
import { ProductGrid } from "./ProductGrid";
import { SortBySelect } from "./SortBySelect";
import { SearchBar } from "../search/SearchBar";

function ResultCount() {
  const { nbHits } = useStats();

  return (
    <p aria-live="polite" className="border-l-2 border-[#A65E35] pl-2 text-sm font-medium text-[#51412D]">
      {nbHits === 1 ? "1 pieza" : `${nbHits.toLocaleString("es-CR")} piezas`}
    </p>
  );
}

function ClearFilters() {
  const { canRefine, refine } = useClearRefinements();

  if (!canRefine) return null;

  return (
    <Button
      type="button"
      variant="link"
      className="h-auto px-0 py-0 text-xs text-[#14110F]/65 hover:text-[#14110F]"
      onClick={refine}
    >
      Quitar filtros
    </Button>
  );
}

export function ResultsPanel() {
  const productsRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const scrollResultsToTop = useCallback(() => {
    const products = productsRef.current;
    const toolbar = toolbarRef.current;
    if (!products || !toolbar) return;
    const headerHeight = Number.parseFloat(getComputedStyle(toolbar).top) || 0;
    window.scrollTo({
      top: window.scrollY + products.getBoundingClientRect().top - headerHeight - toolbar.offsetHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, []);

  return (
    <section aria-label="Resultados de productos">
      <div ref={toolbarRef} className="sticky top-20 z-20 bg-[#F8F4EC]">
        <SearchBar />
      <div className="flex flex-col gap-3 border-b border-[#14110F]/15 bg-[#EFE3CC] px-4 py-3 sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <ResultCount />
          <ClearFilters />
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <SortBySelect />
          <HitsPerPageSelect />
        </div>
      </div>
      </div>

      <div ref={productsRef} className="scroll-mt-80 p-4 sm:p-5">
        <ProductGrid />
      </div>
      <div className="bg-[#14110F]">
        <PaginationControls onPageChange={scrollResultsToTop} />
      </div>
    </section>
  );
}
