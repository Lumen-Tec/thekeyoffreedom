import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProductCard } from "@/components/store/product-card";
import { SOCIAL_ICONS } from "@/components/store/social-icons";
import { buttonVariants } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { getFeaturedProducts } from "@/lib/catalog";
import type { Product } from "@/lib/schemas";
import { site, type SocialLink } from "@/lib/site";
import { cn } from "@/lib/utils";

type CategoryTile = { href: string; label: string; caption: string; image: string; alt: string };

const CATEGORY_TILES: CategoryTile[] = [
  {
    href: "/tienda?cat=camisetas",
    label: "Camisetas",
    caption: "Algodón 100%, la llave bordada",
    image: "/products/camiseta-clasica-blanco-2.webp",
    alt: "Modelo con camiseta blanca TKF frente a un grafiti",
  },
  {
    href: "/tienda?cat=para-ellas",
    label: "Para Ellas",
    caption: "Blusas de corte entallado",
    image: "/products/blusa-celeste-1.webp",
    alt: "Modelo con blusa celeste TKF",
  },
  {
    href: "/tienda?cat=gorras",
    label: "Gorras",
    caption: "Usa la llave en tu cabeza",
    image: "/products/gorra-malla-crema-1.webp",
    alt: "Gorra TKF crema con logo bordado",
  },
];

type Value = { name: string; text: string };

const VALUES: Value[] = [
  { name: "Esfuerzo", text: "Lo que vale la pena se trabaja todos los días." },
  { name: "Sacrificio", text: "Sin sacrificio no hay cambio: esa es la base del éxito." },
  { name: "Lealtad", text: "Con los nuestros, en las buenas y en las difíciles." },
  { name: "Disciplina", text: "Persiste, insiste: tarde o temprano lo lograrás." },
];

const MARQUEE: string[] = ["Esfuerzo", "Sacrificio", "Lealtad", "Disciplina", "Is to feel it"];

export default async function HomePage(): Promise<ReactNode> {
  const featured: Product[] = await getFeaturedProducts(6);

  return (
    <>
      {/* Portada */}
      <section className="relative isolate -mt-16 flex h-[88svh] max-h-[56rem] min-h-[36rem] items-end overflow-hidden pt-16">
        <Image
          src="/products/hero-1.webp"
          alt="Dos personas con camisetas blancas de The Key of Freedom frente a un grafiti"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[50%_30%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/20 lg:bg-gradient-to-r lg:from-background lg:via-background/75 lg:to-transparent"
        />
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="oklch(0.9 0.01 250)" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Hecho en Costa Rica
            </p>
            <h1 className="mt-4 font-heading text-5xl leading-[1.02] text-balance text-silver sm:text-7xl">
              Somos la llave de la libertad
            </h1>
            <p className="mt-5 max-w-md text-pretty text-lg text-foreground/80">
              Ropa con significado para quienes no se rinden. {site.tagline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/tienda" className={cn(buttonVariants(), "h-12 gap-2 px-6 text-base")}>
                Ver la tienda
                <ArrowRightIcon />
              </Link>
              <Link
                href="/nosotros"
                className={cn(buttonVariants({ variant: "outline" }), "h-12 px-6 text-base backdrop-blur-sm")}
              >
                Nuestra historia
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Franja de valores */}
      <div className="overflow-hidden border-y border-border/60 bg-card/40 py-4" aria-hidden="true">
        <div className="flex w-max animate-marquee">
          {[0, 1].map(
            (copy: number): ReactNode => (
              <ul key={copy} className="flex shrink-0 items-center">
                {[...MARQUEE, ...MARQUEE].map(
                  (word: string, i: number): ReactNode => (
                    <li key={`${copy}-${i}`} className="flex items-center gap-8 pr-8 font-heading text-2xl text-foreground/70">
                      {word}
                      <Image src="/brand/key.png" alt="" width={118} height={318} className="h-6 w-auto opacity-60" />
                    </li>
                  ),
                )}
              </ul>
            ),
          )}
        </div>
      </div>

      {/* Destacados */}
      <section aria-labelledby="destacados" className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Colección</p>
            <h2 id="destacados" className="mt-2 font-heading text-4xl sm:text-5xl">
              Destacados
            </h2>
          </div>
          <Link
            href="/tienda"
            className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground sm:inline-flex"
          >
            Ver todo <ArrowRightIcon className="size-4" />
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
          {featured.map(
            (product: Product): ReactNode => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ),
          )}
        </ul>
        <Link
          href="/tienda"
          className={cn(buttonVariants({ variant: "outline" }), "mt-8 h-11 w-full text-base sm:hidden")}
        >
          Ver toda la tienda
        </Link>
      </section>

      {/* Categorías */}
      <section aria-labelledby="categorias" className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <h2 id="categorias" className="mb-8 font-heading text-4xl sm:text-5xl">
          Encuentra tu llave
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {CATEGORY_TILES.map(
            (tile: CategoryTile): ReactNode => (
              <li key={tile.href}>
                <Link
                  href={tile.href}
                  className="group relative flex aspect-[4/5] items-end overflow-hidden rounded-lg outline outline-1 -outline-offset-1 outline-white/10 sm:aspect-[3/4]"
                >
                  <Image
                    src={tile.image}
                    alt={tile.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-[scale] duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="relative p-5">
                    <h3 className="font-heading text-3xl text-white">{tile.label}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                      {tile.caption}
                      <ArrowRightIcon className="size-4 transition-[translate] duration-150 group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </Link>
              </li>
            ),
          )}
        </ul>
      </section>

      {/* Manifiesto */}
      <section aria-labelledby="manifiesto" className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 overflow-hidden rounded-xl border border-border/60 bg-card/50 lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[32rem]">
            <Image
              src="/products/hero-3.webp"
              alt="Joven de espaldas con camiseta negra TKF frente al mar"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="px-6 pb-10 lg:py-12 lg:pr-12 lg:pl-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Nuestros valores</p>
            <h2 id="manifiesto" className="mt-3 font-heading text-4xl leading-tight text-balance sm:text-5xl">
              A la cima no se llega superando a los demás, sino superándote a ti mismo
            </h2>
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              {VALUES.map(
                (value: Value): ReactNode => (
                  <div key={value.name}>
                    <dt className="font-semibold">{value.name}</dt>
                    <dd className="mt-1 text-pretty text-sm text-muted-foreground">{value.text}</dd>
                  </div>
                ),
              )}
            </dl>
            <Link
              href="/nosotros"
              className="mt-8 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
            >
              Conoce nuestra historia <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Redes */}
      <section aria-labelledby="redes" className="mx-auto w-full max-w-7xl px-4 pt-24 text-center sm:px-6 lg:px-8">
        <h2 id="redes" className="font-heading text-4xl sm:text-5xl">
          Únete al movimiento
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
          Síguenos para ver lanzamientos, sesiones de fotos y a nuestra comunidad usando la llave.
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {site.socials.map((social: SocialLink): ReactNode => {
            const Icon: (props: { className?: string }) => ReactNode = SOCIAL_ICONS[social.name];
            return (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline" }), "h-12 gap-2.5 px-5 text-base")}
                >
                  <Icon className="size-5" />
                  {social.handle}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
