"use client";

import {
  StoreIcon,
  FileSpreadsheetIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  TagsIcon,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type AdminSessionState, signOut, useAdminSession } from "@/lib/admin-session";
import { useOnHide, useOnPathnameChange } from "@/lib/use-navigation-reset";
import { cn } from "@/lib/utils";

type AdminNavItem = { href: string; label: string; icon: LucideIcon };

const NAV: AdminNavItem[] = [
  { href: "/admin/productos", label: "Productos", icon: PackageIcon },
  { href: "/admin/categorias", label: "Categorías", icon: TagsIcon },
  { href: "/admin/importar", label: "Importar", icon: FileSpreadsheetIcon },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }): ReactNode {
  const pathname: string = usePathname();
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV.map((item: AdminNavItem): ReactNode => {
        const active: boolean = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon: LucideIcon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150",
                active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarFooter(): ReactNode {
  const session: AdminSessionState = useAdminSession();
  return (
    <div className="space-y-1 border-t border-border/60 p-3">
      <Link
        href="/"
        className="flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent/60 hover:text-foreground"
      >
        <StoreIcon className="size-4" />
        Ir a la tienda
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent/60 hover:text-foreground"
      >
        <LogOutIcon className="size-4" />
        Cerrar sesión
      </button>
      {session && <p className="truncate px-3 pt-2 text-xs text-muted-foreground">{session.email}</p>}
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }): ReactNode {
  const [open, setOpen] = useState<boolean>(false);
  // El menú del teléfono vive en el layout: se cierra al cambiar de ruta
  // (incluye cerrar sesión y Atrás/Adelante) y si el panel se oculta, para
  // que no reaparezca abierto al volver a entrar.
  useOnPathnameChange((): void => setOpen(false));
  useOnHide((): void => setOpen(false));

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-3 px-6">
          <Image src="/brand/tkf-wordmark.png" alt="The Key of Freedom" width={505} height={306} className="h-8 w-auto" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Panel</span>
        </div>
        <nav aria-label="Panel" className="flex-1 px-3 py-2">
          <NavLinks />
        </nav>
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="-ml-2" />}>
              <MenuIcon className="size-5" />
              <span className="sr-only">Abrir menú</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0">
              <SheetHeader className="h-14 justify-center border-b border-border/60 px-6">
                <SheetTitle className="flex items-center gap-3">
                  <Image src="/brand/tkf-wordmark.png" alt="The Key of Freedom" width={505} height={306} className="h-7 w-auto" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Panel</span>
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Panel" className="flex-1 px-3 py-3">
                <NavLinks onNavigate={(): void => setOpen(false)} />
              </nav>
              <SidebarFooter />
            </SheetContent>
          </Sheet>
          <Image src="/brand/tkf-wordmark.png" alt="The Key of Freedom" width={505} height={306} className="h-7 w-auto" />
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
