"use client";

import { CheckCircle2Icon, ShoppingBagIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ChangeEvent, type FormEvent, type ReactNode, useState } from "react";
import type { ZodSafeParseResult } from "zod";
import { WhatsAppIcon } from "@/components/store/social-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCRC } from "@/lib/availability";
import { type CartLine, type CartState, cartSubtotal, clearCart, useCart } from "@/lib/cart";
import { type Canton, cantonsOf, districtsOf, PROVINCES, type Province } from "@/lib/cr-locations";
import { buildOrderMessage, type OrderForm, orderFormSchema } from "@/lib/order";
import { whatsappUrl } from "@/lib/site";
import { useOnHide } from "@/lib/use-navigation-reset";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<keyof OrderForm, string>>;

const EMPTY_FORM: OrderForm = {
  name: "",
  phone: "",
  province: "",
  canton: "",
  district: "",
  addressDetails: "",
  notes: "",
};

const selectClass: string =
  "h-11 w-full appearance-none rounded-lg border border-input bg-input/30 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-3 pr-9 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive sm:text-sm";

export function OrderFormView(): ReactNode {
  const { lines }: CartState = useCart();
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  // Next.js conserva el estado de las páginas ocultas (<Activity>). Al salir
  // se descarta la confirmación y los errores, para que un pedido nuevo no
  // muestre el "¡Listo!" anterior. Los datos del formulario sí se conservan.
  useOnHide((): void => {
    setSentUrl(null);
    setErrors({});
  });

  const set =
    <K extends keyof OrderForm>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
      const value: string = e.target.value;
      setForm((prev: OrderForm): OrderForm => {
        const next: OrderForm = { ...prev, [key]: value };
        if (key === "province") return { ...next, canton: "", district: "" };
        if (key === "canton") return { ...next, district: "" };
        return next;
      });
      if (errors[key]) setErrors((prev: Errors): Errors => ({ ...prev, [key]: undefined }));
    };

  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const parsed: ZodSafeParseResult<OrderForm> = orderFormSchema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key: keyof OrderForm = issue.path[0] as keyof OrderForm;
        next[key] ??= issue.message;
      }
      setErrors(next);
      // Lleva el foco al primer campo con error una vez pintado.
      requestAnimationFrame((): void => {
        document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      });
      return;
    }

    const url: string = whatsappUrl(buildOrderMessage(parsed.data, lines));
    // Con "noopener" window.open siempre devuelve null, así que se corta el
    // vínculo a mano. Si el navegador bloquea la ventana, se abre aquí mismo.
    const opened: Window | null = window.open(url, "_blank");
    if (opened) opened.opener = null;
    else window.location.href = url;
    setSentUrl(url);
    clearCart();
    window.scrollTo({ top: 0 });
  };

  if (sentUrl) return <OrderSent url={sentUrl} />;
  if (lines.length === 0) return <EmptyCart />;

  const cantons: Canton[] = cantonsOf(form.province);
  const districts: string[] = districtsOf(form.province, form.canton);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <form onSubmit={submit} noValidate className="order-2 space-y-8 lg:order-1">
        <FieldSet>
          <FieldLegend className="font-heading text-2xl">Tus datos</FieldLegend>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={set("name")}
                aria-invalid={!!errors.name}
                className="h-11 text-base sm:text-sm"
              />
              <FieldError>{errors.name}</FieldError>
            </Field>
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="8888-8888"
                value={form.phone}
                onChange={set("phone")}
                aria-invalid={!!errors.phone}
                className="h-11 text-base sm:text-sm"
              />
              <FieldError>{errors.phone}</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend className="font-heading text-2xl">Dirección de entrega</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-3">
            <Field data-invalid={!!errors.province}>
              <FieldLabel htmlFor="province">Provincia</FieldLabel>
              <select
                id="province"
                autoComplete="address-level1"
                value={form.province}
                onChange={set("province")}
                aria-invalid={!!errors.province}
                className={selectClass}
              >
                <option value="">Elige…</option>
                {PROVINCES.map(
                  (p: Province): ReactNode => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ),
                )}
              </select>
              <FieldError>{errors.province}</FieldError>
            </Field>
            <Field data-invalid={!!errors.canton}>
              <FieldLabel htmlFor="canton">Cantón</FieldLabel>
              <select
                id="canton"
                autoComplete="address-level2"
                value={form.canton}
                onChange={set("canton")}
                disabled={!form.province}
                aria-invalid={!!errors.canton}
                className={selectClass}
              >
                <option value="">Elige…</option>
                {cantons.map(
                  (c: Canton): ReactNode => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ),
                )}
              </select>
              <FieldError>{errors.canton}</FieldError>
            </Field>
            <Field data-invalid={!!errors.district}>
              <FieldLabel htmlFor="district">Distrito</FieldLabel>
              <select
                id="district"
                autoComplete="address-level3"
                value={form.district}
                onChange={set("district")}
                disabled={!form.canton}
                aria-invalid={!!errors.district}
                className={selectClass}
              >
                <option value="">Elige…</option>
                {districts.map(
                  (d: string): ReactNode => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ),
                )}
              </select>
              <FieldError>{errors.district}</FieldError>
            </Field>
          </FieldGroup>
          <Field data-invalid={!!errors.addressDetails}>
            <FieldLabel htmlFor="addressDetails">Otras señas</FieldLabel>
            <Textarea
              id="addressDetails"
              autoComplete="street-address"
              rows={3}
              placeholder="Ej.: 200 m norte del parque, casa verde con portón negro"
              value={form.addressDetails}
              onChange={set("addressDetails")}
              aria-invalid={!!errors.addressDetails}
              className="text-base sm:text-sm"
            />
            <FieldError>{errors.addressDetails}</FieldError>
          </Field>
          <Field data-invalid={!!errors.notes}>
            <FieldLabel htmlFor="notes">
              Notas <span className="font-normal text-muted-foreground">(opcional)</span>
            </FieldLabel>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Ej.: entregar después de las 5 p. m."
              value={form.notes}
              onChange={set("notes")}
              aria-invalid={!!errors.notes}
              className="text-base sm:text-sm"
            />
            <FieldError>{errors.notes}</FieldError>
          </Field>
        </FieldSet>

        <div className="space-y-3">
          <Button type="submit" className="h-12 w-full gap-2 text-base">
            <WhatsAppIcon className="size-5" />
            Enviar pedido por WhatsApp
          </Button>
          <p className="text-pretty text-center text-sm text-muted-foreground">
            Se abrirá WhatsApp con tu pedido listo para enviar. Te responderemos para coordinar el pago (SINPE Móvil o
            transferencia) y el costo del envío.
          </p>
        </div>
      </form>

      <OrderSummary lines={lines} />
    </div>
  );
}

function OrderSummary({ lines }: { lines: CartLine[] }): ReactNode {
  return (
    <aside aria-labelledby="resumen" className="order-1 lg:order-2">
      <div className="rounded-xl border border-border/60 bg-card/60 p-5 lg:sticky lg:top-24">
        <h2 id="resumen" className="font-heading text-2xl">
          Resumen
        </h2>
        <ul className="mt-4 divide-y divide-border/60">
          {lines.map(
            (l: CartLine): ReactNode => (
              <li key={l.variantId} className="flex gap-3 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted outline outline-1 -outline-offset-1 outline-white/10">
                  <Image src={l.image} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{l.name}</p>
                  <p className="text-muted-foreground">
                    {l.colorName} · {l.size === "Única" ? "Talla única" : l.size} · x{l.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums">{formatCRC(l.unitPrice * l.quantity)}</p>
              </li>
            ),
          )}
        </ul>
        <dl className="mt-2 space-y-1.5 border-t border-border/60 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-semibold tabular-nums">{formatCRC(cartSubtotal(lines))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Envío</dt>
            <dd className="text-muted-foreground">Por cotizar</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">Precios con IVA incluido.</p>
      </div>
    </aside>
  );
}

function EmptyCart(): ReactNode {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-20 text-center">
      <ShoppingBagIcon className="size-10 text-muted-foreground/60" strokeWidth={1.5} />
      <h2 className="text-lg font-medium">Tu carrito está vacío</h2>
      <p className="max-w-sm text-pretty text-muted-foreground">Agrega productos para hacer tu pedido.</p>
      <Link href="/tienda" className={cn(buttonVariants(), "h-11 px-5")}>
        Ver la tienda
      </Link>
    </div>
  );
}

function OrderSent({ url }: { url: string }): ReactNode {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
      <CheckCircle2Icon className="size-12 text-success" strokeWidth={1.5} />
      <h2 className="font-heading text-4xl">¡Listo!</h2>
      <p className="text-pretty text-muted-foreground">
        Envía el mensaje que se abrió en WhatsApp y te contactaremos para coordinar el pago y el envío.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "outline" }), "h-11 gap-2 px-5")}
      >
        <WhatsAppIcon className="size-4" />
        ¿No se abrió WhatsApp? Ábrelo aquí
      </a>
      <Link href="/tienda" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        Seguir comprando
      </Link>
    </div>
  );
}
