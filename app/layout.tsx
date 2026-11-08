import type { Metadata, Viewport } from "next";
import { Archivo, Grenze_Gotisch } from "next/font/google";
import type { ReactNode } from "react";
import { site, siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import "./globals.css";

/** Lo que usamos de una fuente de next/font (su tipo no se exporta públicamente). */
type FontWithVariable = { className: string; variable: string };

/** Texto e interfaz. Tiene eje de ancho para etiquetas condensadas. */
const archivo: FontWithVariable = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

/** Títulos: gótica afilada, cercana al trazo del logo "TKF". */
const grenze: FontWithVariable = Grenze_Gotisch({
  variable: "--font-grenze",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: `${site.name} · Ropa con significado`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  // El sitio aún no es público: que no aparezca en buscadores.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#121110",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">): ReactNode {
  return (
    <html lang="es-CR" className={cn("dark h-full antialiased", archivo.variable, grenze.variable)}>
      <body className="bg-grain flex min-h-full flex-col">{children}</body>
    </html>
  );
}
