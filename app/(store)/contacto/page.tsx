import { ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SOCIAL_ICONS, WhatsAppIcon } from "@/components/store/social-icons";
import { site, type SocialLink, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos por WhatsApp o síguenos en Instagram, Facebook y TikTok.",
};

type ContactCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  detail: string;
  description: string;
};

function ContactCard({ href, icon, title, detail, description }: ContactCardProps): ReactNode {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-4 rounded-xl border border-border/60 bg-card/50 p-6 transition-colors duration-150 hover:border-border hover:bg-card"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-lg bg-muted">{icon}</span>
        <ArrowUpRightIcon className="size-5 text-muted-foreground transition-[color,translate] duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-0.5 text-sm text-foreground/80">{detail}</p>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}

const SOCIAL_COPY: Record<SocialLink["name"], string> = {
  Instagram: "Lanzamientos, sesiones de fotos y nuestra comunidad.",
  Facebook: "Novedades y publicaciones de la marca.",
  TikTok: "Videos detrás de cámaras y de cómo hacemos nuestras prendas.",
};

export default function ContactPage(): ReactNode {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Contacto</p>
        <h1 className="mt-3 font-heading text-5xl sm:text-6xl">Hablemos</h1>
        <p className="mt-4 text-pretty text-lg text-foreground/80">
          ¿Tienes dudas sobre tallas, colores o tu pedido? Escríbenos por WhatsApp y te respondemos personalmente.
        </p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        <li className="sm:col-span-3">
          <ContactCard
            href={whatsappUrl("¡Hola! Tengo una consulta sobre The Key of Freedom.")}
            icon={<WhatsAppIcon className="size-5" />}
            title="WhatsApp"
            detail={site.whatsappDisplay}
            description="La forma más rápida de consultar existencias, hacer pedidos y coordinar envíos a todo Costa Rica."
          />
        </li>
        {site.socials.map((social: SocialLink): ReactNode => {
          const Icon: (props: { className?: string }) => ReactNode = SOCIAL_ICONS[social.name];
          return (
            <li key={social.name}>
              <ContactCard
                href={social.href}
                icon={<Icon className="size-5" />}
                title={social.name}
                detail={social.handle}
                description={SOCIAL_COPY[social.name]}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
