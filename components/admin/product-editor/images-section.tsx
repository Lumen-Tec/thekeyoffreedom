"use client";

import { ArrowLeftIcon, ArrowRightIcon, ImagePlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type ReactNode, useRef } from "react";
import type { EditorImage } from "@/components/admin/product-editor/editor-types";
import { Button } from "@/components/ui/button";
import type { Color } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type ImagesSectionProps = {
  images: EditorImage[];
  colors: Color[];
  error?: string;
  onChange: (images: EditorImage[]) => void;
};

const MAX_FILE_MB: number = 8;

export function ImagesSection({ images, colors, error, onChange }: ImagesSectionProps): ReactNode {
  const input: React.RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);

  const upload = (e: ChangeEvent<HTMLInputElement>): void => {
    const files: File[] = Array.from(e.target.files ?? []).filter(
      (f: File): boolean => f.type.startsWith("image/") && f.size <= MAX_FILE_MB * 1024 * 1024,
    );
    // Vista previa local: la imagen solo existe en esta pestaña.
    const added: EditorImage[] = files.map(
      (f: File, i: number): EditorImage => ({
        id: `local-${Date.now()}-${i}`,
        src: URL.createObjectURL(f),
        alt: f.name.replace(/\.[^.]+$/, ""),
        local: true,
      }),
    );
    onChange([...images, ...added]);
    e.target.value = "";
  };

  const move = (index: number, delta: number): void => {
    const next: EditorImage[] = [...images];
    const [item]: EditorImage[] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  const update = (index: number, changes: Partial<EditorImage>): void => {
    onChange(images.map((img: EditorImage, i: number): EditorImage => (i === index ? { ...img, ...changes } : img)));
  };

  const remove = (index: number): void => {
    const img: EditorImage = images[index];
    if (img.local) URL.revokeObjectURL(img.src);
    onChange(images.filter((_: EditorImage, i: number): boolean => i !== index));
  };

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {images.map(
            (img: EditorImage, index: number): ReactNode => (
              <li key={img.id} className="space-y-2">
                <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted outline outline-1 -outline-offset-1 outline-white/10">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="160px"
                    unoptimized={img.local}
                    className="object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
                      Portada
                    </span>
                  )}
                  <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
                    <div className="flex gap-1">
                      <IconButton label="Mover antes" disabled={index === 0} onClick={(): void => move(index, -1)}>
                        <ArrowLeftIcon />
                      </IconButton>
                      <IconButton
                        label="Mover después"
                        disabled={index === images.length - 1}
                        onClick={(): void => move(index, 1)}
                      >
                        <ArrowRightIcon />
                      </IconButton>
                    </div>
                    <IconButton label="Quitar imagen" onClick={(): void => remove(index)}>
                      <Trash2Icon />
                    </IconButton>
                  </div>
                </div>
                {colors.length > 1 && (
                  <select
                    aria-label="Color de la imagen"
                    value={img.color ?? ""}
                    onChange={(e: ChangeEvent<HTMLSelectElement>): void => update(index, { color: e.target.value || undefined })}
                    className="h-8 w-full rounded-md border border-input bg-input/30 px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Todos los colores</option>
                    {colors.map(
                      (c: Color): ReactNode => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ),
                    )}
                  </select>
                )}
              </li>
            ),
          )}
        </ul>
      )}

      <input ref={input} type="file" accept="image/*" multiple onChange={upload} className="sr-only" tabIndex={-1} aria-hidden="true" />
      <button
        type="button"
        onClick={(): void => input.current?.click()}
        className={cn(
          "flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center transition-colors duration-150 hover:bg-muted/40",
          error ? "border-destructive/60" : "border-input",
        )}
      >
        <ImagePlusIcon className="size-6 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-sm font-medium">Subir imágenes</span>
        <span className="text-xs text-muted-foreground">JPG, PNG o WebP, hasta {MAX_FILE_MB} MB</span>
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {colors.length > 1 && images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Asigna un color a cada foto para que la galería cambie cuando el cliente elija ese color.
        </p>
      )}
    </div>
  );
}

type IconButtonProps = { label: string; onClick: () => void; disabled?: boolean; children: ReactNode };

function IconButton({ label, onClick, disabled = false, children }: IconButtonProps): ReactNode {
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      className="bg-background/85 backdrop-blur-sm hover:bg-background"
    >
      {children}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
