import Link from "next/link";
import type { SVGProps } from "react";
import { HeaderBrand } from "@/components/HeaderBrand";
import { body, display } from "@/lib/fonts";

type IconProps = SVGProps<SVGSVGElement>;

function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.5h2.55l.4-3H13.5V8.62c0-.87.24-1.46 1.5-1.46h1.6V4.47c-.28-.04-1.23-.12-2.34-.12-2.31 0-3.9 1.41-3.9 4v2.15H7.5v3h2.86V21h3.14Z" />
    </svg>
  );
}

function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 3h-2.9v11.2a2.4 2.4 0 1 1-2.4-2.4c.22 0 .44.03.64.09V9.1a5.4 5.4 0 0 0-.64-.04 5.4 5.4 0 1 0 5.4 5.4V8.63a6.3 6.3 0 0 0 3.4 1.02V6.74A3.6 3.6 0 0 1 16.6 3Z" />
    </svg>
  );
}

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/thekeyoffreedom/",
    Icon: InstagramIcon,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61594478213014",
    Icon: FacebookIcon,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@thekeyoffreedomcr",
    Icon: TikTokIcon,
  },
];

const navigation = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/tienda" },
];

export function Footer() {
  return (
    <footer className="bg-[#14110F] px-6 pb-8 pt-16 sm:px-10 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 border-b border-[#EDE6D6]/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <HeaderBrand light />
            <p
              className={`${body.className} mt-6 max-w-xs text-sm leading-relaxed text-[#EDE6D6]/60`}
            >
              Ropa y accesorios hechos en Costa Rica para quienes no necesitan
              permiso para sentirse libres.
            </p>
          </div>

          {/* Navegación */}
          <nav aria-label="Navegación del sitio">
            <h2
              className={`${body.className} text-[11px] font-medium uppercase tracking-[0.3em] text-[#EDE6D6]/40`}
            >
              Explorá
            </h2>
            <ul className="mt-6 space-y-3">
              {navigation.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`${body.className} text-sm text-[#EDE6D6]/75 transition-colors hover:text-[#E8B94B]`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h2
              className={`${body.className} text-[11px] font-medium uppercase tracking-[0.3em] text-[#EDE6D6]/40`}
            >
              Contacto
            </h2>
            <ul
              className={`${body.className} mt-6 space-y-3 text-sm text-[#EDE6D6]/75`}
            >
              <li></li>
              <li>
                <a
                  href="https://wa.me/50672087081"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#E8B94B]"
                >
                  WhatsApp
                </a>
              </li>
              <li className="text-[#EDE6D6]/50">Cahuita, Costa Rica</li>
            </ul>

            <p
              className={`${display.className} mt-8 text-sm font-medium text-[#E8B94B]`}
            >
              Sentí la libertad.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className={`${body.className} text-xs text-[#EDE6D6]/40`}>
            {new Date().getFullYear()} thekeyoffreedom
          </p>

          {/* Redes sociales — lado derecho */}
          <ul className="flex items-center gap-3 sm:justify-end">
            {socials.map(({ name, href, Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`thekeyoffreedom en ${name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDE6D6]/15 text-[#EDE6D6]/80 transition-colors duration-300 hover:border-[#E8B94B] hover:bg-[#E8B94B] hover:text-[#14110F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8B94B]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}