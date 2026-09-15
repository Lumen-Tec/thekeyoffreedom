import Link from "next/link";
import { AvailabilityBadge } from "./AvailabilityBadge";
import type { ProductHit } from "@/lib/types";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: currency || "CRC",
    maximumFractionDigits: 0,
  }).format(price);
}

export function ProductCard({ product }: { product: ProductHit }) {
  const { objectID, image, title, brand, price, currency, in_stock, stock_quantity } = product;

  return (
    <article className="group min-w-0 border border-[#D8C9AD] bg-[#FFFCF5] transition-colors hover:border-[#B58018]">
      <Link
        href={`/tienda/${encodeURIComponent(objectID)}`}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[#B58018] focus-visible:ring-offset-2"
        aria-label={`Ver detalles de ${title}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#EDE6D6]">
          {/* Algolia can return images from several approved asset hosts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.alt || title}
            className="size-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03]"
          />
          <div className="absolute top-3 left-3">
            <AvailabilityBadge available={in_stock} />
          </div>
        </div>

        <div className="flex flex-col border-t border-[#D8C9AD] p-3 transition-colors group-hover:bg-[#F1E1B9]">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8B4B2B]">
            {brand}
          </p>
          <h3 className="mt-1 text-sm font-medium leading-snug text-[#14110F]">
            {title}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-[#14110F]">
              {formatPrice(price, currency)}
            </p>
            {in_stock && stock_quantity > 0 && (
              <p className="text-xs text-[#14110F]/60">{stock_quantity} unidades</p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
