import type { ReactNode } from "react";
import { CartSheet } from "@/components/store/cart-sheet";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { Toaster } from "@/components/ui/sonner";

export default function StoreLayout({ children }: LayoutProps<"/">): ReactNode {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartSheet />
      <Toaster position="bottom-center" />
    </>
  );
}
