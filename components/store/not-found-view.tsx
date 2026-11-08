import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Vista de "no encontrado", compartida por la página 404 y el detalle de producto. */
export function NotFoundView(): ReactNode {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
      <Image src="/brand/key.png" alt="" width={118} height={318} className="h-24 w-auto opacity-80" />
      <h1 className="font-heading text-5xl">Esta puerta no abre</h1>
      <p className="text-pretty text-muted-foreground">
        No encontramos lo que buscas. Puede que el producto ya no esté disponible o que el enlace haya cambiado.
      </p>
      <Link href="/tienda" className={cn(buttonVariants(), "h-11 px-5")}>
        Ver la tienda
      </Link>
    </div>
  );
}
