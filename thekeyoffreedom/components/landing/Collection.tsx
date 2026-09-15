import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const collections = [
  {
    title: "Camisas",
    description: "Tu forma de expresarte, todos los días.",
    image: "/images/tee.png",
    href: "/tienda?q=camisas",
  },
  {
    title: "Gorras",
    description: "El detalle que hace tu estilo.",
    image: "/images/cap.png",
    href: "/tienda?q=gorras",
  },
];

export function Collection() {
  return (
    <section id="colecciones" aria-labelledby="collections-title" className="scroll-mt-20 bg-[#EDE6D6] px-6 py-20 text-[#14110F] sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#8B6218]">Colecciones</p>
            <h2 id="collections-title" className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-5xl">
              Elegí tu libertad.
            </h2>
          </div>
          <Link href="/tienda" className="inline-flex min-h-11 items-center gap-3 self-start border-b border-[#14110F]/30 text-sm font-medium transition-colors hover:border-[#B58018] hover:text-[#8B6218] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B58018]">
            Ver toda la colección <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {collections.map((collection) => (
            <Link key={collection.title} href={collection.href} className="group block bg-[#14110F] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B58018]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#D8C9AD]">
                <Image src={collection.image} alt={`${collection.title} de thekeyoffreedom`} fill sizes="(min-width: 1280px) 564px, (min-width: 768px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
              </div>
              <div className="flex items-center justify-between gap-4 p-6 text-[#EDE6D6] transition-colors group-hover:bg-[#30271F] sm:p-8">
                <div>
                  <h3 className="font-heading text-2xl font-medium">{collection.title}</h3>
                  <p className="mt-2 text-sm text-[#EDE6D6]/75">{collection.description}</p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center bg-[#E8B94B] text-[#14110F] transition-colors group-hover:bg-[#D9A93A]">
                  <ArrowUpRight aria-hidden="true" className="size-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
