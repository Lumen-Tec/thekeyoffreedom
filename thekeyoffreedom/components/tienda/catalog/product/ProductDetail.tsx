"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { useCart } from "../../cart/CartProvider";
import type { ProductRecord } from "@/lib/types";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: currency || "CRC",
    maximumFractionDigits: 0,
  }).format(price);
}

function normalizeFacetValues(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function ChoiceGroup({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: unknown;
  value: string;
  onChange: (value: string) => void;
}) {
  const options = normalizeFacetValues(values);

  if (options.length === 0) return null;

  return (
    <fieldset>
      <legend className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#14110F]/55">
        {label}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option)}
              className={`min-h-8 border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58018] ${
                isSelected
                  ? "border-[#14110F] bg-[#14110F] text-[#EDE6D6]"
                  : "border-[#14110F]/20 bg-transparent text-[#14110F] hover:border-[#B58018] hover:bg-[#E8B94B]/20"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ProductDetail({ product }: { product: ProductRecord }) {
  const { image, title, brand, description, price, currency, in_stock, stock_quantity, facets } = product;
  const { addItem } = useCart();
  const sizes = normalizeFacetValues(facets?.size);
  const colors = normalizeFacetValues(facets?.color);
  const recommendedUses = normalizeFacetValues(facets?.recommend_use);
  const [size, setSize] = useState(sizes[0] ?? "");
  const [color, setColor] = useState(colors[0] ?? "");

  return (
    <article className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:items-stretch lg:gap-16 lg:px-10">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#EDE6D6] lg:aspect-auto lg:self-stretch">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={image.alt || title} className="absolute inset-0 size-full object-cover" />
      </div>

      <div className="self-start">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#14110F]/55">
          {brand}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-medium leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-xl font-medium">{formatPrice(price, currency)}</p>
        <p className="mt-5 max-w-xl leading-relaxed text-[#14110F]/65">
          {description}
        </p>

        <div className="mt-8 space-y-5">
          <ChoiceGroup label="Talla" values={sizes} value={size} onChange={setSize} />
          <ChoiceGroup label="Color" values={colors} value={color} onChange={setColor} />
          {recommendedUses.length > 0 && (
            <p className="text-sm leading-relaxed text-[#14110F]/60">
              Ideal para: {recommendedUses.join(", ")}.
            </p>
          )}
        </div>

        <div className="mt-8 border-t border-[#14110F]/15 pt-5">
          <div className="flex items-center gap-3">
            <AvailabilityBadge available={in_stock} />
            {in_stock && stock_quantity > 0 && (
              <span className="text-sm text-[#14110F]/75">{stock_quantity} unidades</span>
            )}
          </div>
          <Button
            type="button"
            disabled={!in_stock}
            className="mt-5 h-12 w-full rounded-none bg-[#E8B94B] px-4 text-[#14110F] hover:bg-[#D9A93A] focus-visible:ring-[#B58018] sm:px-8"
            onClick={() => addItem({ product, size, color })}
          >
            {in_stock ? "Agregar al carrito" : "Producto agotado"}
          </Button>
        </div>
      </div>
    </article>
  );
}
