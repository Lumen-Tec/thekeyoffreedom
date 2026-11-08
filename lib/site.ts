/** Datos de la marca usados en todo el sitio. */

export type SocialLink = {
  name: "Instagram" | "Facebook" | "TikTok";
  href: string;
  handle: string;
};

export type SiteConfig = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  /** Número de WhatsApp en formato internacional sin "+" (para wa.me). */
  whatsapp: string;
  /** Número para mostrar. */
  whatsappDisplay: string;
  socials: SocialLink[];
};

export const site: SiteConfig = {
  name: "The Key of Freedom",
  shortName: "TKF",
  tagline: "Is not to think it. Is not to believe it. Is to feel it.",
  description:
    "Camisetas, blusas y gorras de algodón con la llave de la libertad. Marca costarricense nacida de la superación. Envíos a todo Costa Rica.",
  whatsapp: "50672087081",
  whatsappDisplay: "+506 7208 7081",
  socials: [
    { name: "Instagram", href: "https://www.instagram.com/thekeyoffreedom/", handle: "@thekeyoffreedom" },
    { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61594478213014", handle: "The Key of Freedom" },
    { name: "TikTok", href: "https://www.tiktok.com/@thekeyoffreedomcr", handle: "@thekeyoffreedomcr" },
  ],
};

/** URL pública del sitio (Vercel la expone en producción). */
export function siteUrl(): URL {
  const host: string | undefined = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!host) return new URL("http://localhost:3000");
  return new URL(host.startsWith("http") ? host : `https://${host}`);
}

/** Enlace de WhatsApp con un mensaje prellenado. */
export function whatsappUrl(message?: string): string {
  const base: string = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
