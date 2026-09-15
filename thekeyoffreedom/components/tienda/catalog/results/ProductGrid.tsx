import { useHits } from "react-instantsearch";
import { ProductCard } from "../product/ProductCard";
import type { ProductRecord } from "@/lib/types";

export function ProductGrid() {
  const { hits } = useHits<ProductRecord>();

  if (hits.length === 0) {
    return (
      <div className="grid min-h-64 place-items-center border border-dashed border-[#14110F]/20 p-8 text-center">
        <div>
          <h3 className="font-heading text-xl font-medium">No encontramos resultados</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#14110F]/60">
            Probá con otra búsqueda o quitá algunos filtros para ver más piezas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
      {hits.map((product) => (
        <ProductCard key={product.objectID} product={product} />
      ))}
    </div>
  );
}
