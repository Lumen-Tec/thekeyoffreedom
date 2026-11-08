"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { AvailabilityBadge } from "@/components/store/availability-badge";
import { WhatsAppIcon } from "@/components/store/social-icons";
import { Button } from "@/components/ui/button";
import { availabilityOf, formatCRC, productAvailability, type Availability } from "@/lib/availability";
import { type AddResult, addToCart } from "@/lib/cart";
import { SIZES, type Color, type Product, type ProductImage, type Size, type Variant } from "@/lib/schemas";
import { whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type ProductDetailProps = { product: Product; categoryName: string };

function colorsOf(product: Product): Color[] {
  const map: Map<string, Color> = new Map<string, Color>();
  for (const v of product.variants) map.set(v.color.name, v.color);
  return [...map.values()];
}

function sizesOf(product: Product): Size[] {
  const present: Set<Size> = new Set<Size>(product.variants.map((v: Variant): Size => v.size));
  return SIZES.filter((s: Size): boolean => present.has(s));
}

function stockOf(product: Product, color: string): number {
  return product.variants
    .filter((v: Variant): boolean => v.color.name === color)
    .reduce((sum: number, v: Variant): number => sum + v.stock, 0);
}

export function ProductDetail({ product, categoryName }: ProductDetailProps): ReactNode {
  const colors: Color[] = colorsOf(product);
  const sizes: Size[] = sizesOf(product);
  const singleSize: boolean = sizes.length === 1;

  const [color, setColor] = useState<string>(
    (colors.find((c: Color): boolean => stockOf(product, c.name) > 0) ?? colors[0]).name,
  );
  const [size, setSize] = useState<Size | null>(singleSize ? sizes[0] : null);
  const [quantity, setQuantity] = useState<number>(1);
  const [imageIndex, setImageIndex] = useState<number>(0);

  const variantFor = (c: string, s: Size | null): Variant | undefined =>
    s ? product.variants.find((v: Variant): boolean => v.color.name === c && v.size === s) : undefined;
  const variant: Variant | undefined = variantFor(color, size);

  const colorImages: ProductImage[] = product.images.filter((img: ProductImage): boolean => img.color === color);
  const images: ProductImage[] = colorImages.length > 0 ? colorImages : product.images;
  const activeImage: ProductImage = images[Math.min(imageIndex, images.length - 1)];

  const availability: Availability = variant ? availabilityOf(variant.stock) : productAvailability(product);
  const maxQuantity: number = variant?.stock ?? 0;

  const selectColor = (next: string): void => {
    setColor(next);
    setImageIndex(0);
    setQuantity(1);
    // Si la talla elegida no existe o está agotada en el nuevo color, se suelta.
    const nextVariant: Variant | undefined = variantFor(next, size);
    if (!singleSize && (!nextVariant || nextVariant.stock === 0)) setSize(null);
  };

  const add = (): void => {
    if (!variant || variant.stock === 0) return;
    const result: AddResult = addToCart(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colorName: variant.color.name,
        colorHex: variant.color.hex,
        size: variant.size,
        unitPrice: product.price,
        image: (colorImages[0] ?? product.images[0]).src,
        maxQuantity: variant.stock,
      },
      quantity,
    );
    if (result.added === 0) toast.warning("Ya tienes en el carrito todas las unidades disponibles.");
    else if (result.capped) toast.success(`Agregamos ${result.added}: son las últimas disponibles.`);
    setQuantity(1);
  };

  const buttonLabel: string =
    productAvailability(product) === "out" || variant?.stock === 0
      ? "Agotado"
      : !variant
        ? "Elige una talla"
        : "Agregar al carrito";

  const sizeLabel: string =size === "Única" ? "Talla única" : size ? `Talla ${size}` : "";
  const whatsappMessage: string = `¡Hola! Me interesa la ${product.name}${color ? ` en ${color.toLowerCase()}` : ""}${sizeLabel ? `, ${sizeLabel.toLowerCase()}` : ""}.`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      {/* Galería */}
      <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted outline outline-1 -outline-offset-1 outline-white/10">
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        {images.length > 1 && (
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {images.map(
              (img: ProductImage, i: number): ReactNode => (
                <li key={img.src} className="shrink-0">
                  <button
                    type="button"
                    onClick={(): void => setImageIndex(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-current={img.src === activeImage.src}
                    className={cn(
                      "relative block size-20 overflow-hidden rounded-md outline outline-1 -outline-offset-1 outline-white/10 transition-opacity duration-150",
                      img.src === activeImage.src ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      {/* Información y compra */}
      <div className="flex flex-col gap-7">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{categoryName}</p>
          <h1 className="font-heading text-4xl leading-tight text-balance sm:text-5xl">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-2xl font-semibold tabular-nums">{formatCRC(product.price)}</p>
            <AvailabilityBadge availability={availability} />
          </div>
          <p className="text-sm text-muted-foreground">IVA incluido · Envío a todo Costa Rica, cotizado aparte.</p>
        </div>

        {/* Color */}
        <fieldset>
          <legend className="mb-3 text-sm">
            <span className="text-muted-foreground">Color: </span>
            <span className="font-medium">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-3">
            {colors.map((c: Color): ReactNode => {
              const soldOut: boolean = stockOf(product, c.name) === 0;
              const selected: boolean = c.name === color;
              return (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={selected}
                  title={c.name}
                  onClick={(): void => selectColor(c.name)}
                  className={cn(
                    "relative size-11 rounded-full border border-white/20 transition-[box-shadow] duration-150",
                    selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    soldOut && "opacity-40",
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {soldOut && (
                    <span aria-hidden="true" className="absolute inset-0 m-auto h-px w-full rotate-45 bg-foreground/80" />
                  )}
                  <span className="sr-only">
                    {c.name}
                    {soldOut ? " (agotado)" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Talla */}
        {!singleSize && (
          <fieldset>
            <legend className="mb-3 text-sm">
              <span className="text-muted-foreground">Talla: </span>
              <span className="font-medium">{size ?? "elige una"}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s: Size): ReactNode => {
                const v: Variant | undefined = variantFor(color, s);
                const unavailable: boolean = !v || v.stock === 0;
                const selected: boolean = s === size;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={selected}
                    disabled={unavailable}
                    onClick={(): void => {
                      setSize(s);
                      setQuantity(1);
                    }}
                    className={cn(
                      "relative h-11 min-w-14 rounded-md border px-4 text-sm font-medium transition-colors duration-150",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-input/20 hover:bg-input/50",
                      unavailable && "cursor-not-allowed text-muted-foreground line-through opacity-50",
                    )}
                  >
                    {s}
                    <span className="sr-only">{unavailable ? " (agotada)" : ""}</span>
                  </button>
                );
              })}
            </div>
            {variant && availabilityOf(variant.stock) === "low" && (
              <p className="mt-3 text-sm text-warning">
                {variant.stock === 1 ? "¡Queda 1 unidad!" : `¡Quedan ${variant.stock} unidades!`}
              </p>
            )}
          </fieldset>
        )}

        {/* Cantidad y acciones */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex items-center rounded-md border border-input">
              <Button
                variant="ghost"
                size="icon"
                className="size-12 rounded-r-none"
                disabled={quantity <= 1}
                onClick={(): void => setQuantity(quantity - 1)}
                aria-label="Quitar una unidad"
              >
                <MinusIcon />
              </Button>
              <span className="w-10 text-center tabular-nums" aria-live="polite" aria-label={`Cantidad: ${quantity}`}>
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-12 rounded-l-none"
                disabled={!variant || quantity >= maxQuantity}
                onClick={(): void => setQuantity(quantity + 1)}
                aria-label="Agregar una unidad"
              >
                <PlusIcon />
              </Button>
            </div>
            <Button
              className="h-12 flex-1 text-base"
              disabled={!variant || variant.stock === 0}
              onClick={add}
            >
              {buttonLabel}
            </Button>
          </div>
          <a
            href={whatsappUrl(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-input text-sm font-medium transition-colors duration-150 hover:bg-input/40"
          >
            <WhatsAppIcon className="size-4" />
            Consultar por WhatsApp
          </a>
        </div>

        <div className="space-y-4 border-t border-border/60 pt-6">
          <p className="text-pretty leading-relaxed text-muted-foreground">{product.description}</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>· Algodón 100%</li>
            <li>· Logo bordado de The Key of Freedom</li>
            <li>· Empaque hecho a mano por nuestro equipo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
