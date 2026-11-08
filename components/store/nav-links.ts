/** Navegación principal de la tienda. */

export type NavLink = { href: string; label: string };

export const NAV_LINKS: NavLink[] = [
  { href: "/tienda", label: "Tienda" },
  { href: "/tienda?cat=camisetas", label: "Camisetas" },
  { href: "/tienda?cat=para-ellas", label: "Para Ellas" },
  { href: "/tienda?cat=gorras", label: "Gorras" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

/** Acceso al panel desde la tienda (visible mientras sea un prototipo). */
export const ADMIN_LINK: NavLink = { href: "/admin", label: "Panel" };
