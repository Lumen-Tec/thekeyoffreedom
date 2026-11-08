"use client";

import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCRC } from "@/lib/availability";
import {
  type CartLine,
  type CartState,
  cartCount,
  cartSubtotal,
  removeFromCart,
  setCartOpen,
  setQuantity,
  useCart,
} from "@/lib/cart";
import { useOnPathnameChange } from "@/lib/use-navigation-reset";
import { cn } from "@/lib/utils";

export function CartSheet(): ReactNode {
  const { lines, open }: CartState = useCart();
  const count: number = cartCount(lines);
  const close = (): void => setCartOpen(false);
  // El carrito vive en el layout: se cierra también al navegar con Atrás/Adelante.
  useOnPathnameChange(close);

  return (
    <Sheet open={open} onOpenChange={setCartOpen}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle className="text-base">Tu carrito</SheetTitle>
          <SheetDescription>
            {count === 0 ? "Aún no has agregado productos." : `${count} ${count === 1 ? "producto" : "productos"}`}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBagIcon className="size-10 text-muted-foreground/60" strokeWidth={1.5} />
            <p className="text-pretty text-muted-foreground">Explora la tienda y elige tu próxima llave.</p>
            <Link href="/tienda" onClick={close} className={cn(buttonVariants(), "h-11 px-5")}>
              Ver la tienda
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border/60 overflow-y-auto overscroll-contain px-4">
              {lines.map(
                (line: CartLine): ReactNode => (
                  <CartItem key={line.variantId} line={line} onNavigate={close} />
                ),
              )}
            </ul>
            <SheetFooter className="gap-3 border-t border-border/60 bg-card/50">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold tabular-nums">{formatCRC(cartSubtotal(lines))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Envío</dt>
                  <dd className="text-muted-foreground">Por cotizar</dd>
                </div>
              </dl>
              <Link href="/pedido" onClick={close} className={cn(buttonVariants(), "h-11 w-full text-base")}>
                Continuar con el pedido
              </Link>
              <p className="text-center text-xs text-muted-foreground">Precios con IVA incluido.</p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

type CartItemProps = { line: CartLine; onNavigate: () => void };

function CartItem({ line, onNavigate }: CartItemProps): ReactNode {
  const atMax: boolean = line.quantity >= line.maxQuantity;

  return (
    <li className="flex gap-3 py-4">
      <Link
        href={`/tienda/${line.slug}`}
        onClick={onNavigate}
        className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted outline outline-1 -outline-offset-1 outline-white/10"
      >
        <Image src={line.image} alt="" fill sizes="80px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/tienda/${line.slug}`} onClick={onNavigate} className="truncate font-medium hover:underline">
            {line.name}
          </Link>
          <span className="shrink-0 text-sm font-semibold tabular-nums">{formatCRC(line.unitPrice * line.quantity)}</span>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-3 rounded-full border border-white/20"
            style={{ backgroundColor: line.colorHex }}
          />
          {line.colorName} · {line.size === "Única" ? "Talla única" : `Talla ${line.size}`}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-md border border-input">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-r-none"
              onClick={(): void => setQuantity(line.variantId, line.quantity - 1)}
              aria-label={`Quitar una unidad de ${line.name}`}
            >
              <MinusIcon />
            </Button>
            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
              {line.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-l-none"
              disabled={atMax}
              onClick={(): void => setQuantity(line.variantId, line.quantity + 1)}
              aria-label={`Agregar una unidad de ${line.name}`}
            >
              <PlusIcon />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={(): void => removeFromCart(line.variantId)}
          >
            <Trash2Icon />
            Eliminar
          </Button>
        </div>
        {atMax && <p className="mt-1 text-xs text-warning">Tienes todas las unidades disponibles.</p>}
      </div>
    </li>
  );
}
