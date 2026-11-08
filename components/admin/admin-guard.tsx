"use client";

import { LoaderCircleIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { type AdminSessionState, useAdminSession } from "@/lib/admin-session";

/**
 * Protege el panel: sin sesión, lleva al inicio de sesión.
 *
 * Las páginas se renderizan siempre (Next.js necesita el segmento para
 * validar la navegación instantánea); mientras no hay sesión confirmada
 * quedan tapadas por una capa de carga e inertes.
 */
export function AdminGuard({ children }: { children: ReactNode }): ReactNode {
  const session: AdminSessionState = useAdminSession();
  const router: ReturnType<typeof useRouter> = useRouter();
  const pathname: string = usePathname();
  const authorized: boolean = !!session;

  useEffect((): void => {
    if (session === null) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [session, pathname, router]);

  return (
    <>
      {!authorized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background" aria-busy="true">
          <LoaderCircleIcon className="size-6 animate-spin text-muted-foreground" />
          <span className="sr-only">Cargando el panel</span>
        </div>
      )}
      <div inert={!authorized} aria-hidden={!authorized} className="contents">
        {children}
      </div>
    </>
  );
}
