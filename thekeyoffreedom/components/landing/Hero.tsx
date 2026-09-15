import Image from "next/image";
import Link from "next/link";
import { body, display } from "@/lib/fonts";

export function Hero() {
  return (
    <section className="relative h-[calc(100svh-5rem)] min-h-[540px] w-full overflow-hidden bg-[#14110F]">
      <Image
        src="/images/hero.png"
        alt="Colección thekeyoffreedom"
        fill
        preload
        className="object-cover object-[75%_center] lg:object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#14110F] via-[#14110F]/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#14110F]/85 via-[#14110F]/10 to-transparent" />


      <div className="absolute bottom-10 left-6 right-6 sm:bottom-16 sm:left-10 sm:right-auto sm:max-w-xl">
        <h1 className={display.className}>
          <span className="block text-2xl font-medium leading-[0.95] text-[#EDE6D6]/80 sm:text-3xl">
            No es pensarlo,
          </span>
          <span className="block text-3xl font-bold leading-[0.95] text-[#EDE6D6] sm:text-4xl">
            no es creerlo,
          </span>
          <span className="block text-5xl font-black leading-[0.9] text-[#EDE6D6] sm:text-7xl">
            es sentirlo.
          </span>
        </h1>

        <Link
          href="/tienda"
          className={`${body.className} mt-8 inline-block bg-[#E8B94B] px-7 py-3 text-sm font-medium text-[#14110F] transition-colors hover:bg-[#D9A93A]`}
        >
          Ver la colección
        </Link>
      </div>
    </section>
  );
}
