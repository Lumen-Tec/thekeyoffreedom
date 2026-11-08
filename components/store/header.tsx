import { LayoutDashboardIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CartButton } from "@/components/store/cart-button";
import { MobileNav } from "@/components/store/mobile-nav";
import { ADMIN_LINK, NAV_LINKS, type NavLink } from "@/components/store/nav-links";
import { site } from "@/lib/site";

export function Header(): ReactNode {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <MobileNav />

        <Link href="/" className="flex shrink-0 items-center rounded-md" aria-label={`${site.name}, inicio`}>
          <Image src="/brand/tkf-wordmark.png" alt="" width={505} height={306} priority className="h-9 w-auto" />
        </Link>

        <nav aria-label="Principal" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map(
              (link: NavLink): ReactNode => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link
            href={ADMIN_LINK.href}
            className="flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            <LayoutDashboardIcon className="size-4" />
            <span className="sr-only sm:not-sr-only">{ADMIN_LINK.label}</span>
            <span className="sr-only">de administración</span>
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
