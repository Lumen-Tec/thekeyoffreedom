import Image from "next/image";
import Link from "next/link";

export function HeaderBrand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="thekeyoffreedom — Inicio"
      className="flex items-center gap-2"
    >
      <Image
        src="/logo.svg"
        alt="Logo de thekeyoffreedom"
        width={60}
        height={32}
        style={{ width: 60, height: "auto" }}
        className={light ? "brightness-0 invert" : undefined}
      />
      <span className={"flex flex-col leading-tight " + (light ? "text-[#EDE6D6]" : "text-[#14110F]")}>
        <span className="text-base font-semibold">thekeyoffreedom</span>
        <small className={"text-[10px] " + (light ? "text-[#EDE6D6]/70" : "text-[#14110F]/60")}>
          SENTÍ LA LIBERTAD
        </small>
      </span>
    </Link>
  );
}
