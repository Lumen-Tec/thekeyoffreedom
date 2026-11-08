import { z } from "zod";
import { formatCRC } from "@/lib/availability";
import { type CartLine, cartSubtotal } from "@/lib/cart";
import { districtsOf } from "@/lib/cr-locations";
import { site } from "@/lib/site";

/** Datos del formulario de pedido (`/pedido`). */
export type OrderForm = {
  name: string;
  /** 8 dígitos, sin guiones. */
  phone: string;
  province: string;
  canton: string;
  district: string;
  addressDetails: string;
  notes: string;
};

export const orderFormSchema: z.ZodType<OrderForm> = z
  .object({
    name: z.string().trim().min(3, "Escribe tu nombre completo.").max(80, "El nombre es demasiado largo."),
    phone: z
      .string()
      .transform((value: string): string => value.replace(/\D/g, "").replace(/^506(?=\d{8}$)/, ""))
      .pipe(z.string().regex(/^[2-8]\d{7}$/, "Escribe un teléfono de Costa Rica de 8 dígitos.")),
    province: z.string().min(1, "Elige la provincia."),
    canton: z.string().min(1, "Elige el cantón."),
    district: z.string().min(1, "Elige el distrito."),
    addressDetails: z
      .string()
      .trim()
      .min(10, "Agrega otras señas para encontrar la dirección.")
      .max(300, "Las señas son demasiado largas."),
    notes: z.string().trim().max(300, "La nota es demasiado larga."),
  })
  .refine(
    (form: OrderForm): boolean => districtsOf(form.province, form.canton).includes(form.district),
    { message: "Elige un distrito válido.", path: ["district"] },
  );

/** `88887777` → `8888-7777` */
export function formatPhone(phone: string): string {
  return phone.replace(/^(\d{4})(\d{4})$/, "$1-$2");
}

/** Mensaje de WhatsApp con el pedido, en el formato que recibe el negocio. */
export function buildOrderMessage(form: OrderForm, lines: CartLine[]): string {
  const items: string[] = lines.map(
    (l: CartLine): string =>
      `• ${l.name} — ${l.colorName} — ${l.size === "Única" ? "Talla única" : `Talla ${l.size}`} — x${l.quantity} — ${formatCRC(l.unitPrice * l.quantity)}`,
  );

  const parts: string[] = [
    `*Nuevo pedido — ${site.name}* 🗝️`,
    "",
    `*Cliente:* ${form.name}`,
    `*Teléfono:* ${formatPhone(form.phone)}`,
    `*Dirección:* ${form.district}, ${form.canton}, ${form.province}`,
    `Señas: ${form.addressDetails}`,
    "",
    "*Productos:*",
    ...items,
    "",
    `*Subtotal:* ${formatCRC(cartSubtotal(lines))} (IVA incluido)`,
    "*Envío:* por cotizar",
  ];
  if (form.notes) parts.push("", `*Notas:* ${form.notes}`);
  return parts.join("\n");
}
