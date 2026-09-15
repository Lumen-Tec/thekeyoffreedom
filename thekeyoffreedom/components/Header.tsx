import Link from "next/link";
import { HeaderBrand } from "@/components/HeaderBrand";
import { CartSheet } from "@/components/tienda/cart/CartSheet";

export function Header() {
  return (
      <header className="fixed inset-x-0 top-0 z-40 h-20 border-b border-[#14110F]/15 bg-[#EDE6D6] px-4 sm:px-6 lg:px-10">
        <nav aria-label="Tienda" className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3">
          <div className="[&_a>span]:hidden min-[400px]:[&_a>span]:flex">
            <HeaderBrand />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tienda" className="hidden text-sm underline-offset-4 transition-colors hover:text-[#946814] hover:underline sm:block">Colección</Link>
            <CartSheet />
          </div>
        </nav>
      </header>
  );
}
