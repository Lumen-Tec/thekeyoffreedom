import { body, display } from "@/lib/fonts";

export function Manifesto() {
  return (
    <section id="historia" className="bg-[#14110F] px-6 py-24 sm:px-10 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <p
            className={`${body.className} text-[11px] font-medium uppercase tracking-[0.3em] text-[#E8B94B]`}
          >
            Nuestra historia
          </p>
          <h2
            className={`${display.className} mt-5 text-3xl font-bold leading-[1] text-[#EDE6D6] sm:text-5xl`}
          >
            La libertad no se explica. Se lleva puesta.
          </h2>
        </div>

        <div
          className={`${body.className} space-y-5 text-base leading-relaxed text-[#EDE6D6]/70`}
        >
          <p>
            thekeyoffreedom nace en Costa Rica con una idea simple: la ropa
            también puede ser un recordatorio. Un recordatorio de que no
            necesitás permiso para ser quien sos.
          </p>
          <p>
            Diseñamos, estampamos y empacamos cada pieza acá. Sin stock masivo,
            sin catálogos prestados. Solo prendas que aguantan el uso diario y
            que dicen algo cuando te las ponés.
          </p>
          <p
            className={`${display.className} pt-2 text-lg font-medium text-[#E8B94B]`}
          >
            Sentí la libertad.
          </p>
        </div>
      </div>
    </section>
  );
}
