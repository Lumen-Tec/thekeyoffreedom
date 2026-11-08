import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OrderFormView } from "@/components/store/order/order-form";

export const metadata: Metadata = {
  title: "Completar pedido",
};

export default function OrderPage(): ReactNode {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Último paso</p>
        <h1 className="mt-2 font-heading text-4xl sm:text-5xl">Completa tu pedido</h1>
      </header>
      <OrderFormView />
    </div>
  );
}
