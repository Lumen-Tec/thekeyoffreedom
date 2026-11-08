"use client";

import { useSyncExternalStore } from "react";

/**
 * Sesión del panel. En esta etapa las credenciales son fijas y se validan
 * en el navegador; en producción se reemplaza por Supabase Auth sin cambiar
 * la interfaz (`signIn`, `signOut`, `useAdminSession`).
 */

export type AdminUser = { email: string; name: string };

/** `undefined` mientras aún no se lee el navegador (servidor e hidratación). */
export type AdminSessionState = AdminUser | null | undefined;

const STORAGE_KEY: string = "tkf:admin-session:v1";

export type AdminCredentials = { email: string; password: string };

const ADMIN_ACCOUNT: AdminCredentials & { user: AdminUser } = {
  email: "admin@thekeyoffreedom.com",
  password: "LaLlave2026",
  user: { email: "admin@thekeyoffreedom.com", name: "The Key of Freedom" },
};

/**
 * Credenciales con las que el formulario de acceso aparece ya completo, para
 * que el cliente entre al panel con un solo clic mientras sea un prototipo.
 * En producción se elimina y el formulario arranca vacío.
 */
export const PREFILLED_CREDENTIALS: AdminCredentials = {
  email: ADMIN_ACCOUNT.email,
  password: ADMIN_ACCOUNT.password,
};

let session: AdminSessionState = undefined;
const listeners: Set<() => void> = new Set<() => void>();

function read(): AdminUser | null {
  try {
    const raw: string | null = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  if (session === undefined) session = read();
  listeners.add(listener);
  return (): void => {
    listeners.delete(listener);
  };
}

const getSnapshot = (): AdminSessionState => session;
const getServerSnapshot = (): AdminSessionState => undefined;

export function useAdminSession(): AdminSessionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type SignInResult = { ok: true } | { ok: false; error: string };

export function signIn(email: string, password: string): SignInResult {
  const valid: boolean =
    email.trim().toLowerCase() === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password;
  if (!valid) return { ok: false, error: "El correo o la contraseña no son correctos." };
  session = ADMIN_ACCOUNT.user;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Sin almacenamiento la sesión dura lo que la pestaña.
  }
  emit();
  return { ok: true };
}

export function signOut(): void {
  session = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que limpiar.
  }
  emit();
}
