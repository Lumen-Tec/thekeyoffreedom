import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { NAV_LINKS, type NavLink } from "@/components/store/nav-links";
import { SOCIAL_ICONS, WhatsAppIcon } from "@/components/store/social-icons";
import { site, type SocialLink, whatsappUrl } from "@/lib/site";

export function Footer(): ReactNode {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <Image src="/brand/tkf-wordmark.png" alt={site.name} width={505} height={306} className="h-10 w-auto" />
          <p className="max-w-xs text-pretty text-sm text-muted-foreground">
            Somos más que una marca de ropa: somos un mensaje, un movimiento. Somos la llave de la libertad.
          </p>
          <p className="font-heading text-lg text-silver">{site.tagline}</p>
        </div>

        <nav aria-label="Pie de página">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Explorar</h2>
          <ul className="mt-4 space-y-1">
            {NAV_LINKS.map(
              (link: NavLink): ReactNode => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex py-1 text-sm transition-colors duration-150 hover:text-muted-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contáctanos</h2>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 py-1 text-sm transition-colors duration-150 hover:text-muted-foreground"
          >
            <WhatsAppIcon className="size-4" />
            {site.whatsappDisplay}
          </a>
          <ul className="mt-4 flex gap-1">
            {site.socials.map((social: SocialLink): ReactNode => {
              const Icon: (props: { className?: string }) => ReactNode = SOCIAL_ICONS[social.name];
              return (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="-ml-2 flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-5" />
                    <span className="sr-only">{social.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto w-full max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {site.name} · Hecho en Costa Rica
        </p>
      </div>
    </footer>
  );
}
