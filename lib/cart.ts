"use client";

import { useSyncExternalStore } from "react";
import type { Size } from "@/lib/schemas";

/**
 * Carrito persistido en `localStorage`. Es un store externo mínimo leído con
 * `useSyncExternalStore`: en el servidor (y en la primera hidratación) el
 * carrito está vacío, y luego se sincroniza con lo guardado en el navegador.
 * Las líneas guardan una copia de los datos del producto para no depender
 * del catálogo al mostrar el carrito o armar el mensaje de WhatsApp.
 */

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  colorName: string;
  colorHex: string;
  size: Size;
  /** Colones, IVA incluido. */
  unitPrice: number;
  image: string;
  quantity: number;
  /** Existencias de la variante al agregarla; tope de cantidad. */
  maxQuantity: number;
};

export type CartState = {
  lines: CartLine[];
  /** El panel lateral del carrito está abierto. */
  open: boolean;
};

const STORAGE_KEY: string = "tkf:cart:v1";
const EMPTY: CartState = { lines: [], open: false };

let state: CartState = EMPTY;
let hydrated: boolean = false;
const listeners: Set<() => void> = new Set<() => void>();

function readStorage(): CartLine[] {
  try {
    const raw: string | null = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartLine[]).filter((l: CartLine): boolean => l.quantity > 0) : [];
  } catch {
    return [];
  }
}

function writeStorage(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Almacenamiento lleno o bloqueado: el carrito sigue funcionando en memoria.
  }
}

function hydrate(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = { ...state, lines: readStorage() };
  // Mantiene el carrito sincronizado entre pestañas.
  window.addEventListener("storage", (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return;
    state = { ...state, lines: readStorage() };
    emit();
  });
}

function emit(): void {
  for (const listener of listeners) listener();
}

function setState(next: CartState, persist: boolean = true): void {
  state = next;
  if (persist) writeStorage(next.lines);
  emit();
}

function subscribe(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return (): void => {
    listeners.delete(listener);
  };
}

const getSnapshot = (): CartState => state;
const getServerSnapshot = (): CartState => EMPTY;

// ── Acciones ─────────────────────────────────────────────────

export type AddResult = { added: number; capped: boolean };

/** Agrega unidades de una variante; nunca supera las existencias. */
export function addToCart(line: Omit<CartLine, "quantity">, quantity: number = 1): AddResult {
  hydrate();
  const existing: CartLine | undefined = state.lines.find((l: CartLine): boolean => l.variantId === line.variantId);
  const current: number = existing?.quantity ?? 0;
  const target: number = Math.min(current + quantity, line.maxQuantity);
  const added: number = target - current;

  const lines: CartLine[] = existing
    ? state.lines.map((l: CartLine): CartLine => (l.variantId === line.variantId ? { ...l, ...line, quantity: target } : l))
    : [...state.lines, { ...line, quantity: target }];

  setState({ lines, open: true });
  return { added, capped: current + quantity > line.maxQuantity };
}

export function setQuantity(variantId: string, quantity: number): void {
  const lines: CartLine[] = state.lines
    .map((l: CartLine): CartLine =>
      l.variantId === variantId ? { ...l, quantity: Math.max(0, Math.min(quantity, l.maxQuantity)) } : l,
    )
    .filter((l: CartLine): boolean => l.quantity > 0);
  setState({ ...state, lines });
}

export function removeFromCart(variantId: string): void {
  setState({ ...state, lines: state.lines.filter((l: CartLine): boolean => l.variantId !== variantId) });
}

export function clearCart(): void {
  setState({ ...state, lines: [] });
}

export function setCartOpen(open: boolean): void {
  setState({ ...state, open }, false);
}

// ── Lectura ──────────────────────────────────────────────────

export function useCart(): CartState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum: number, l: CartLine): number => sum + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum: number, l: CartLine): number => sum + l.unitPrice * l.quantity, 0);
}
