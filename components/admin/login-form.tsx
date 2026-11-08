"use client";

import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type AdminSessionState,
  PREFILLED_CREDENTIALS,
  type SignInResult,
  signIn,
  useAdminSession,
} from "@/lib/admin-session";
import { useOnHide } from "@/lib/use-navigation-reset";

/** Solo rutas internas del panel, para no redirigir a otro sitio. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin/productos";
}

export function LoginForm(): ReactNode {
  const router: ReturnType<typeof useRouter> = useRouter();
  const next: string = safeNext(useSearchParams().get("next"));
  const session: AdminSessionState = useAdminSession();

  const [email, setEmail] = useState<string>(PREFILLED_CREDENTIALS.email);
  const [password, setPassword] = useState<string>(PREFILLED_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Con sesión abierta no tiene sentido ver el formulario.
  useEffect((): void => {
    if (session) router.replace(next);
  }, [session, next, router]);

  const signInTimer: React.RefObject<number | undefined> = useRef<number>(undefined);

  // Next.js conserva el estado de las páginas que oculta al navegar
  // (<Activity>). Al salir del login se limpia lo transitorio, para que al
  // volver (p. ej. tras cerrar sesión) no aparezca "Entrando…" ni lo que se
  // haya escrito; y se cancela un inicio de sesión a medias para que no se
  // abra la sesión en segundo plano. Vuelven las credenciales precargadas.
  useOnHide((): void => {
    window.clearTimeout(signInTimer.current);
    setSubmitting(false);
    setEmail(PREFILLED_CREDENTIALS.email);
    setPassword(PREFILLED_CREDENTIALS.password);
    setShowPassword(false);
    setError(null);
  });

  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }
    setSubmitting(true);
    setError(null);
    // Pequeña espera para que el inicio de sesión se sienta como una petición real.
    signInTimer.current = window.setTimeout((): void => {
      const result: SignInResult = signIn(email, password);
      if (!result.ok) {
        setError(result.error);
        setSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Image src="/brand/tkf-wordmark.png" alt="The Key of Freedom" width={505} height={306} priority className="h-14 w-auto" />
        <div>
          <h1 className="text-xl font-semibold">Panel de administración</h1>
          <p className="mt-1 text-sm text-muted-foreground">Inicia sesión para gestionar tu tienda.</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="rounded-xl border border-border/60 bg-card/60 p-6">
        <FieldGroup>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="email">Correo</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value)}
              aria-invalid={!!error}
              className="h-11 text-base sm:text-sm"
            />
          </Field>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)}
                aria-invalid={!!error}
                className="h-11 pr-11 text-base sm:text-sm"
              />
              <button
                type="button"
                onClick={(): void => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
              </button>
            </div>
            <FieldError>{error}</FieldError>
          </Field>
          <Button type="submit" className="h-11 text-base" disabled={submitting}>
            {submitting && <LoaderCircleIcon className="animate-spin" />}
            {submitting ? "Entrando…" : "Iniciar sesión"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
