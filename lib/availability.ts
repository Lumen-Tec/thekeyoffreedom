import type { Product, Variant } from "@/lib/schemas";

/** Con estas existencias o menos se muestra "Últimas unidades". */
export const LOW_STOCK_THRESHOLD: number = 3;

export type Availability = "available" | "low" | "out";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: "Disponible",
  low: "Últimas unidades",
  out: "Agotado",
};

export function availabilityOf(stock: number): Availability {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "available";
}

export function totalStock(variants: Pick<Variant, "stock">[]): number {
  return variants.reduce((sum: number, v: Pick<Variant, "stock">): number => sum + v.stock, 0);
}

/**
 * Disponibilidad a nivel de producto: agotado si no queda nada; "últimas
 * unidades" si todo lo que queda está en pocas unidades.
 */
export function productAvailability(product: Pick<Product, "variants">): Availability {
  const inStock: Variant[] = product.variants.filter((v: Variant): boolean => v.stock > 0);
  if (inStock.length === 0) return "out";
  return inStock.every((v: Variant): boolean => v.stock <= LOW_STOCK_THRESHOLD) ? "low" : "available";
}

const crc: Intl.NumberFormat = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

/** `12000` → `₡12 000` */
export function formatCRC(amount: number): string {
  return crc.format(amount);
}
