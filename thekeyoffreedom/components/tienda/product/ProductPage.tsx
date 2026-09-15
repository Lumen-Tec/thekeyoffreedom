"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { ProductDetail } from "../catalog/product/ProductDetail";
import type { ProductRecord } from "@/lib/types";

export function ProductPage({ product }: { product: ProductRecord }) {
  return (
      <section className="min-h-screen bg-[#F8F4EC] text-[#14110F]">
        <div className="px-4 pt-6 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#14110F]/65 transition-colors hover:text-[#14110F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58018]"
              >
                <ArrowLeftIcon aria-hidden="true" className="size-4" />
                <span>Volver a la colección</span>
              </Link>
            </div>
          </div>
        </div>
        <ProductDetail product={product} />
      </section>
  );
}
