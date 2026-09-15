import { body } from "@/lib/fonts";

const items = [
  "SENTÍ LA LIBERTAD",
  "HECHO EN COSTA RICA",
  "EDICIONES LIMITADAS",
  "ENVÍOS A TODO EL PAÍS",
];

const COPIES = 4;

export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-[#EDE6D6]/10 bg-[#14110F] py-4">
      <div
        className="flex w-max"
        style={{
          animation: "marquee-scroll 15s linear infinite",
          willChange: "transform",
        }}
      >
        {Array.from({ length: COPIES }).map((_, copy) => (
          <ul
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy > 0}
          >
            {items.map((item) => (
              <li key={item} className="flex shrink-0 items-center">
                <span
                  className={`${body.className} px-6 text-[11px] font-medium uppercase tracking-[0.3em] text-[#EDE6D6]/70`}
                >
                  {item}
                </span>
                <span aria-hidden className="text-xs text-[#E8B94B]">
                  ✦
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
