"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Con Cache Components, Next.js oculta las páginas con `<Activity>` en lugar
 * de desmontarlas, y conserva su estado. Estos hooks limpian lo transitorio.
 */

/**
 * Ejecuta `callback` cuando el componente se oculta (o se desmonta): sirve
 * para cerrar diálogos, cancelar temporizadores y soltar estados de carga.
 */
export function useOnHide(callback: () => void): void {
  const latest: React.RefObject<() => void> = useRef<() => void>(callback);
  useLayoutEffect((): void => {
    latest.current = callback;
  });
  useLayoutEffect((): (() => void) => {
    return (): void => latest.current();
  }, []);
}

/**
 * Ejecuta `callback` cada vez que cambia la ruta. Para componentes que viven
 * en un layout (no se ocultan al navegar) como menús y el carrito lateral,
 * que deben cerrarse también al usar Atrás/Adelante del navegador.
 */
export function useOnPathnameChange(callback: () => void): void {
  const pathname: string = usePathname();
  const latest: React.RefObject<() => void> = useRef<() => void>(callback);
  const first: React.RefObject<boolean> = useRef<boolean>(true);
  useLayoutEffect((): void => {
    latest.current = callback;
  });
  useEffect((): void => {
    if (first.current) {
      first.current = false;
      return;
    }
    latest.current();
  }, [pathname]);
}
