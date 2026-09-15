import { body, display } from "@/lib/fonts";

const testimonials = [
  {
    quote:
      "La calidad se siente apenas la abrís. Es la única hoodie que uso desde que llegó.",
    name: "María F.",
    location: "San José",
  },
  {
    quote:
      "Pedí un viernes y me llegó el lunes a Cartago. Y el diseño llama la atención siempre.",
    name: "Andrés R.",
    location: "Cartago",
  },
  {
    quote:
      "Compré dos y me escribieron por Instagram para confirmar la talla. Detallazo.",
    name: "Karla M.",
    location: "Heredia",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[#EDE6D6] px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <p
          className={`${body.className} text-[11px] font-medium uppercase tracking-[0.3em] text-[#14110F]/50`}
        >
          Lo que dicen
        </p>
        <h2
          className={`${display.className} mt-4 max-w-lg text-3xl font-bold leading-[1] text-[#14110F] sm:text-4xl`}
        >
          Gente que ya lo sintió
        </h2>

        <ul className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {testimonials.map((item) => (
            <li
              key={item.name}
              className="flex flex-col justify-between border-t border-[#14110F]/15 pt-6"
            >
              <p
                className={`${body.className} text-base leading-relaxed text-[#14110F]/80`}
              >
                “{item.quote}”
              </p>
              <div className="mt-6">
                <p
                  className={`${body.className} text-sm font-medium text-[#14110F]`}
                >
                  {item.name}
                </p>
                <p
                  className={`${body.className} text-xs uppercase tracking-[0.2em] text-[#14110F]/40`}
                >
                  {item.location}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
