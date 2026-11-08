"use client";

import { ShoppingBagIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cartCount, setCartOpen, useCart, type CartState } from "@/lib/cart";

export function CartButton(): ReactNode {
  const { lines }: CartState = useCart();
  const count: number = cartCount(lines);

  return (
    <Button variant="ghost" size="icon-lg" className="relative -mr-2" onClick={(): void => setCartOpen(true)}>
      <ShoppingBagIcon className="size-5" />
      <span className="sr-only">{count > 0 ? `Carrito, ${count} productos` : "Carrito vacío"}</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-semibold leading-4.5 text-primary-foreground tabular-nums"
        >
          {count}
        </span>
      )}
    </Button>
  );
}
