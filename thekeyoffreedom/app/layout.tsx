import type { Metadata } from "next";
import { body, display } from "@/lib/fonts";
import { Header } from "@/components/Header";
import { CartProvider } from "@/components/tienda/cart/CartProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "thekeyoffreedom",
    template: "%s | thekeyoffreedom",
  },
  description:
    "Camisas y gorras hechos en Costa Rica. Explorá la colección y coordiná tu pedido por WhatsApp.",
  keywords: ["ropa Costa Rica", "streetwear", "thekeyoffreedom", "Cahuita"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className={`${body.className} flex min-h-full flex-col`}>
        <CartProvider>
          <Header />
          <div className="flex flex-1 flex-col pt-20">{children}</div>
        </CartProvider>
      </body>
    </html>
  );
}
