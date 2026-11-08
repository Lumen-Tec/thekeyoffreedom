import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "The Key of Freedom nació como fruto de la superación. Somos más que una marca de ropa: somos un mensaje.",
};

type Pillar = { title: string; text: string };

/** Textos basados en las publicaciones de la marca. */
const PILLARS: Pillar[] = [
  {
    title: "Nunca rendirse",
    text: "Los sacrificios son necesarios para el progreso. La disciplina y la perseverancia son armas invaluables para vencerte a ti mismo y ser mejor cada día.",
  },
  {
    title: "Conocer nuestras raíces",
    text: "Saber de dónde venimos nos ayuda a orientarnos hacia dónde queremos llegar. La solución empieza por dedicarse tiempo y aprender a conocerse.",
  },
  {
    title: "Juntos",
    text: "Promovemos el trabajo en equipo, los lazos familiares y la empatía. Creemos en ayudarnos unos a otros, porque todos merecemos ser libres.",
  },
];

export default function AboutPage(): ReactNode {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="grid items-end gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Nuestra historia</p>
          <h1 className="mt-3 font-heading text-5xl leading-[1.05] text-balance text-silver sm:text-6xl">
            Más que una marca de ropa, somos un mensaje
          </h1>
        </div>
        <p className="text-pretty text-lg leading-relaxed text-foreground/80">
          {site.name} nació como fruto de la superación de muchas adversidades de la vida. Somos el ejemplo de que en los
          momentos difíciles hay una esperanza, de que el dolor sirve para reconstruirnos y de que cambiar nuestro futuro
          depende de las decisiones que tomemos hoy.
        </p>
      </header>

      <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-xl outline outline-1 -outline-offset-1 outline-white/10 sm:aspect-[21/9]">
        <Image
          src="/products/hero-2.webp"
          alt="Pareja con camisetas amarillas TKF frente al mar"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <section aria-labelledby="significado" className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
        <div className="flex items-start gap-5">
          <Image src="/brand/key.png" alt="" width={118} height={318} className="h-28 w-auto" />
          <div>
            <h2 id="significado" className="font-heading text-4xl">
              ¿Qué es TKF?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Son las siglas de <span className="text-foreground">The Key of Freedom</span>: en español, la llave de la
              libertad.
            </p>
          </div>
        </div>
        <p className="text-pretty text-lg leading-relaxed text-foreground/80">
          Todos nacimos libres, pero uno de los primeros obstáculos que debemos vencer es nuestra propia mente. Educar la
          mente y el espíritu, formar hábitos y tener una actitud de agradecimiento son llaves que abren puertas. Por eso
          cada prenda lleva la llave: es un recordatorio de que rendirse no es una opción y de que siempre hay un camino
          más, el camino de la libertad.
        </p>
      </section>

      <section aria-label="Lo que nos mueve" className="mt-20">
        <ul className="grid gap-4 md:grid-cols-3">
          {PILLARS.map(
            (pillar: Pillar): ReactNode => (
              <li key={pillar.title} className="rounded-xl border border-border/60 bg-card/50 p-6">
                <h3 className="font-heading text-2xl">{pillar.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{pillar.text}</p>
              </li>
            ),
          )}
        </ul>
      </section>

      <section aria-labelledby="detalles" className="mt-20 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl outline outline-1 -outline-offset-1 outline-white/10 sm:aspect-[4/3]">
          <Image
            src="/products/camiseta-clasica-negro-1.webp"
            alt="Camiseta negra TKF con la llave bordada"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 id="detalles" className="font-heading text-4xl text-balance sm:text-5xl">
            Los pequeños detalles son parte de nosotros
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Trabajamos con tela de algodón 100%: elegante, fresca y cómoda para salir, aguantar el calor o el frío. Hemos
            perfeccionado la confección con el tiempo, y cada prenda llega en un empaque hecho a mano por nuestro equipo.
          </p>
          <blockquote className="mt-8 border-l-2 border-silver/60 pl-5 font-heading text-2xl text-silver">
            {site.tagline}
          </blockquote>
          <Link href="/tienda" className={cn(buttonVariants(), "mt-8 h-12 px-6 text-base")}>
            Encuentra tu llave
          </Link>
        </div>
      </section>
    </div>
  );
}
