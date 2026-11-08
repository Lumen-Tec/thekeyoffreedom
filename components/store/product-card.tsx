import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AvailabilityBadge } from "@/components/store/availability-badge";
import { type Availability, formatCRC, productAvailability } from "@/lib/availability";
import type { Color, Product, ProductImage } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  /** Para la primera fila visible (mejora el LCP). */
  priority?: boolean;
};

export function uniqueColors(product: Product): Color[] {
  const map: Map<string, Color> = new Map<string, Color>();
  for (const v of product.variants) map.set(v.color.name, v.color);
  return [...map.values()];
}

export function ProductCard({ product, priority = false }: ProductCardProps): ReactNode {
  const availability: Availability = productAvailability(product);
  const colors: Color[] = uniqueColors(product);
  const [cover, hover]: (ProductImage | undefined)[] = product.images;

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted outline outline-1 -outline-offset-1 outline-white/10">
        {cover && (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              "object-cover transition-[opacity,scale] duration-300 ease-out",
              hover && "group-hover:opacity-0",
              availability === "out" && "opacity-60 grayscale-[40%]",
            )}
          />
        )}
        {hover && (
          <Image
            src={hover.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          />
        )}
        {availability !== "available" && (
          <AvailabilityBadge availability={availability} className="absolute top-2 left-2 bg-background/85 backdrop-blur-sm" />
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <h3 className="text-sm font-medium leading-snug sm:text-base">
          <Link href={`/tienda/${product.slug}`} className="after:absolute after:inset-0 after:rounded-lg">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold tabular-nums sm:text-base">{formatCRC(product.price)}</p>
          {colors.length > 1 && (
            <ul className="flex -space-x-1" aria-label={`${colors.length} colores`}>
              {colors.slice(0, 4).map(
                (c: Color): ReactNode => (
                  <li
                    key={c.name}
                    title={c.name}
                    className="size-3.5 rounded-full border border-background ring-1 ring-white/15"
                    style={{ backgroundColor: c.hex }}
                  />
                ),
              )}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
