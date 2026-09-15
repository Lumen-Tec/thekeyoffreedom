import { body, display } from "@/lib/fonts";

const values = [
  {
    number: "01",
    title: "Diseño propio",
    text: "Cada gráfico se diseña y estampa acá. Nada de plantillas ni catálogos genéricos.",
  },
  {
    number: "02",
    title: "Envíos a todo el país",
    text: "Coordinamos cada entrega directamente por WhatsApp para cualquier punto de Costa Rica.",
  },
  {
    number: "03",
    title: "Atención real",
    text: "Te respondemos personas, no bots. Cambios y devoluciones sin complicaciones.",
  },
];

export function Values() {
  return (
    <section className="bg-[#14110F] px-6 pb-24 sm:px-10 sm:pb-32">
      <div className="mx-auto max-w-6xl">
        <ul className="grid gap-px overflow-hidden border border-[#EDE6D6]/10 sm:grid-cols-3">
          {values.map((value) => (
            <li key={value.number} className="bg-[#14110F] p-8 sm:p-10">
              <span
                className={`${display.className} text-sm font-bold text-[#E8B94B]`}
              >
                {value.number}
              </span>
              <h3
                className={`${display.className} mt-6 text-lg font-semibold leading-tight text-[#EDE6D6]`}
              >
                {value.title}
              </h3>
              <p
                className={`${body.className} mt-3 text-sm leading-relaxed text-[#EDE6D6]/60`}
              >
                {value.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
