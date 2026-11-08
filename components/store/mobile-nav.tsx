"use client";

import { LayoutDashboardIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { ADMIN_LINK, NAV_LINKS, type NavLink } from "@/components/store/nav-links";
import { SOCIAL_ICONS } from "@/components/store/social-icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { site, type SocialLink } from "@/lib/site";
import { useOnPathnameChange } from "@/lib/use-navigation-reset";

export function MobileNav(): ReactNode {
  const [open, setOpen] = useState<boolean>(false);
  // El menú vive en el layout: se cierra también al navegar con Atrás/Adelante.
  useOnPathnameChange((): void => setOpen(false));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="-ml-2 lg:hidden" />}>
        <MenuIcon className="size-5" />
        <span className="sr-only">Abrir menú</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] max-w-xs overscroll-contain">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle>
            <Image src="/brand/tkf-wordmark.png" alt={site.name} width={505} height={306} className="h-8 w-auto" />
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Menú" className="flex-1 overflow-y-auto px-2">
          <ul className="flex flex-col">
            {NAV_LINKS.map(
              (link: NavLink): ReactNode => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(): void => setOpen(false)}
                    className="flex h-12 items-center rounded-md px-3 text-base font-medium transition-colors duration-150 hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <Link
            href={ADMIN_LINK.href}
            onClick={(): void => setOpen(false)}
            className="mt-3 flex h-12 items-center gap-3 rounded-md px-3 text-base font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            <LayoutDashboardIcon className="size-4" />
            Panel de administración
          </Link>
        </nav>
        <div className="flex gap-1 border-t border-border/60 p-4">
          {site.socials.map((social: SocialLink): ReactNode => {
            const Icon: (props: { className?: string }) => ReactNode = SOCIAL_ICONS[social.name];
            return (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-5" />
                <span className="sr-only">{social.name}</span>
              </a>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
