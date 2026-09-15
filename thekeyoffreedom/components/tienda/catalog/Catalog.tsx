"use client";

import { Configure, InstantSearch } from "react-instantsearch";
import { algolia_indices, searchClient } from "@/lib/searchClient";
import { FilterPanel } from "./filters/FilterPanel";
import { MobileFilterSheet } from "./filters/MobileFilterSheet";
import { ResultsPanel } from "./results/ResultsPanel";

export function Catalog({ initialQuery = "" }: { initialQuery?: string }) {
  return (
      <InstantSearch
        indexName={algolia_indices.main}
        searchClient={searchClient}
        initialUiState={{ [algolia_indices.main]: { query: initialQuery } }}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <Configure hitsPerPage={12} />

        <section
          aria-labelledby="catalog-title"
          className="bg-[#EDE6D6] px-4 py-4 text-[#14110F] sm:px-6 sm:py-6 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">

            <div className="py-10 sm:py-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#B58018]">
                thekeyoffreedom
              </p>
              <h1
                id="catalog-title"
                className="mt-3 max-w-2xl font-heading text-3xl font-semibold tracking-[-0.06em] sm:text-5xl"
              >
                Vestí lo que te hace sentir libre.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#14110F]/65 sm:text-base">
                Encontrá prendas y accesorios hechos en Costa Rica. Los precios ya
                incluyen los impuestos aplicables.
              </p>
            </div>

            <div className="border border-[#14110F]/15 bg-[#F8F4EC] lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
              <aside className="hidden self-start border-r border-[#D8C9AD] bg-[#F1E1B9] lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-5rem)] lg:flex-col">
                <div className="flex h-[76px] shrink-0 flex-col justify-center border-b border-[#E8B94B]/30 bg-[#14110F] px-5 text-[#EDE6D6]">
                  <h2 className="font-heading text-lg font-medium">Filtrá</h2>
                  <p className="mt-1 text-xs text-[#EDE6D6]/75">
                    Afiná la colección a tu manera.
                  </p>
                </div>
                <FilterPanel className="min-h-0 flex-1 overflow-hidden [&_[data-slot=scroll-area-viewport]]:overscroll-contain" />
              </aside>

              <div className="min-w-0">
                <ResultsPanel />
              </div>
            </div>
          </div>
        </section>

        <MobileFilterSheet />
      </InstantSearch>
  );
}
