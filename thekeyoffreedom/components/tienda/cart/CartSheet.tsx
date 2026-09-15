"use client";

import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import { useCart, type CartItem } from "./CartProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const WHATSAPP_NUMBER = "50672087081";

function formatPrice(price: number, currency = "CRC") {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity } = useCart();
  const isAtStockLimit = item.stockQuantity > 0 && item.quantity >= item.stockQuantity;

  return (
    <li className="flex gap-3 border-b border-[#EDE6D6]/15 py-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt={item.imageAlt || item.title}
        className="size-20 shrink-0 object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-[#EDE6D6]">{item.title}</h3>
            {(item.size || item.color) && (
              <p className="mt-1 text-xs text-[#EDE6D6]/60">
                {[item.size && `Talla: ${item.size}`, item.color && `Color: ${item.color}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="-mr-1 text-[#EDE6D6]/55 hover:bg-[#E8B94B]/10 hover:text-[#E8B94B]"
            onClick={() => removeItem(item.id)}
          >
            <Trash2Icon aria-hidden="true" />
            <span className="sr-only">Quitar {item.title}</span>
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center rounded-md border border-[#EDE6D6]/25">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-none text-[#EDE6D6] hover:bg-[#E8B94B]/10 hover:text-[#E8B94B]"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity === 1}
            >
              <MinusIcon aria-hidden="true" />
              <span className="sr-only">Restar una unidad</span>
            </Button>
            <span className="w-7 text-center text-xs text-[#EDE6D6] tabular-nums">{item.quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-none text-[#EDE6D6] hover:bg-[#E8B94B]/10 hover:text-[#E8B94B]"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={isAtStockLimit}
            >
              <PlusIcon aria-hidden="true" />
              <span className="sr-only">Sumar una unidad</span>
            </Button>
          </div>
          <p className="text-sm font-medium text-[#E8B94B]">
            {formatPrice(item.price * item.quantity, item.currency)}
          </p>
        </div>
      </div>
    </li>
  );
}

function CheckoutForm() {
  const { items, total } = useCart();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const productLines = items.map((item) => {
      const options = [item.size && `Talla: ${item.size}`, item.color && `Color: ${item.color}`]
        .filter(Boolean)
        .join(", ");
      return `- ${item.title}${options ? ` (${options})` : ""} × ${item.quantity}: ${formatPrice(item.price * item.quantity, item.currency)}`;
    });
    const message = [
      "Hola, quiero coordinar este pedido para thekeyoffreedom:",
      "",
      "Productos:",
      ...productLines,
      "",
      `Total: ${formatPrice(total, items[0]?.currency)}`,
      "",
      "Datos de contacto:",
      `Nombre: ${formData.get("name")}`,
      `Teléfono: ${formData.get("phone")}`,
      `Dirección: ${formData.get("address")}`,
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form id="cart-checkout" onSubmit={handleSubmit} className="space-y-4 border-t border-[#EDE6D6]/15 bg-[#14110F] p-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-heading text-base font-medium text-[#EDE6D6]">Total</p>
        <p className="text-lg font-medium text-[#E8B94B]">{formatPrice(total, items[0]?.currency)}</p>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="cart-name" className="text-[#EDE6D6]/75">Nombre completo</Label>
          <Input id="cart-name" name="name" required className="h-10 border-[#EDE6D6]/25 bg-transparent text-[#EDE6D6] focus-visible:border-[#E8B94B] focus-visible:ring-[#E8B94B]/30" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="cart-phone" className="text-[#EDE6D6]/75">Teléfono</Label>
          <Input id="cart-phone" name="phone" type="tel" required className="h-10 border-[#EDE6D6]/25 bg-transparent text-[#EDE6D6] focus-visible:border-[#E8B94B] focus-visible:ring-[#E8B94B]/30" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="cart-address" className="text-[#EDE6D6]/75">Dirección en Costa Rica</Label>
          <Input id="cart-address" name="address" required className="h-10 border-[#EDE6D6]/25 bg-transparent text-[#EDE6D6] focus-visible:border-[#E8B94B] focus-visible:ring-[#E8B94B]/30" />
        </div>
      </div>

      <p className="text-center text-xs leading-relaxed text-[#EDE6D6]/55">
        El envío se cotiza directamente con thekeyoffreedom.
      </p>
    </form>
  );
}

export function CartSheet() {
  const { items, itemCount } = useCart();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="h-11 gap-2 rounded-none bg-[#E8B94B] px-3 text-[#14110F] hover:bg-[#D9A93A]" />
        }
      >
        <ShoppingBagIcon aria-hidden="true" className="size-4" />
        <span className="text-xs font-medium">Carrito</span>
        <span className="grid size-5 place-items-center rounded-none bg-[#14110F] text-[10px] text-[#EDE6D6]" aria-label={`${itemCount} productos en el carrito`}>
          {itemCount}
        </span>
      </SheetTrigger>
      <SheetContent side="right" className="max-h-dvh w-full max-w-md gap-0 overflow-hidden border-[#14110F] bg-[#14110F] p-0 text-[#EDE6D6] data-[side=right]:w-full">
        <SheetHeader className="border-b border-[#EDE6D6]/15 pr-12">
          <SheetTitle className="text-[#E8B94B]">Tu carrito</SheetTitle>
          <p className="text-sm text-[#EDE6D6]/60">
            {itemCount === 1 ? "1 producto" : `${itemCount} productos`}
          </p>
        </SheetHeader>

        {items.length > 0 ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ul>
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </ul>
              <CheckoutForm />
            </div>
            <div className="shrink-0 border-t border-[#EDE6D6]/15 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button type="submit" form="cart-checkout" className="h-12 w-full rounded-none bg-[#E8B94B] text-[#14110F] hover:bg-[#D9A93A]">
                Enviar pedido por WhatsApp
              </Button>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <ShoppingBagIcon aria-hidden="true" className="mx-auto size-6 text-[#E8B94B]" />
              <p className="mt-4 font-heading text-lg font-medium text-[#EDE6D6]">Tu carrito está vacío</p>
              <p className="mt-2 text-sm leading-relaxed text-[#EDE6D6]/60">
                Elegí una pieza de la colección para comenzar tu pedido.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
