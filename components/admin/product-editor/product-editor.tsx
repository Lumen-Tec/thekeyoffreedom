"use client";

import { ArrowLeftIcon, LoaderCircleIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagesSection } from "@/components/admin/product-editor/images-section";
import { type EditorImage, imagesFromProduct } from "@/components/admin/product-editor/editor-types";
import { VariantsSection } from "@/components/admin/product-editor/variants-section";
import { PageHeader } from "@/components/admin/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type EditorErrors,
  type EditorState,
  stockKey,
  stateFromProduct,
  validateEditor,
} from "@/components/admin/product-editor/editor-types";
import type { Category, Product } from "@/lib/schemas";
import { useOnHide } from "@/lib/use-navigation-reset";
import { cn } from "@/lib/utils";

type ProductEditorProps = {
  /** Sin producto, el editor crea uno nuevo. */
  product?: Product;
  categories: Category[];
};

type CategoryItem = { value: string; label: string };

/** Simula la latencia de una petición de guardado. */
const SAVE_DELAY_MS: number = 700;

export function ProductEditor({ product, categories }: ProductEditorProps): ReactNode {
  const router: ReturnType<typeof useRouter> = useRouter();
  const isNew: boolean = !product;

  const [state, setState] = useState<EditorState>((): EditorState => stateFromProduct(product));
  const [images, setImages] = useState<EditorImage[]>((): EditorImage[] => imagesFromProduct(product));
  const [errors, setErrors] = useState<EditorErrors>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const saveTimer: React.RefObject<number | undefined> = useRef<number>(undefined);

  // Si se sale de la página a mitad de un guardado, se cancela: si no, al
  // terminar llevaría a la lista desde otra pantalla. También se cierra el
  // diálogo de eliminar para que no reaparezca abierto al volver.
  useOnHide((): void => {
    window.clearTimeout(saveTimer.current);
    setSaving(false);
    setDeleteOpen(false);
  });

  const categoryItems: CategoryItem[] = categories.map((c: Category): CategoryItem => ({ value: c.id, label: c.name }));

  const patch = (changes: Partial<EditorState>): void => {
    setState((prev: EditorState): EditorState => ({ ...prev, ...changes }));
    const touched: (keyof EditorErrors)[] = Object.keys(changes) as (keyof EditorErrors)[];
    if (touched.some((k: keyof EditorErrors): boolean => !!errors[k])) {
      setErrors((prev: EditorErrors): EditorErrors => {
        const next: EditorErrors = { ...prev };
        for (const k of touched) delete next[k];
        return next;
      });
    }
  };

  const save = (): void => {
    const found: EditorErrors = validateEditor(state, images);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Revisa los campos marcados antes de guardar.");
      requestAnimationFrame((): void => {
        document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      });
      return;
    }
    setSaving(true);
    saveTimer.current = window.setTimeout((): void => {
      setSaving(false);
      if (isNew) {
        toast.success(`“${state.name.trim()}” se creó correctamente.`);
        // Next.js conserva el estado de la página al ocultarla: se limpia
        // para que "Nuevo producto" vuelva a abrir vacío.
        setState(stateFromProduct());
        setImages([]);
        router.push("/admin/productos");
      } else {
        toast.success("Cambios guardados.");
      }
    }, SAVE_DELAY_MS);
  };

  const remove = (): void => {
    setDeleteOpen(false);
    toast.success(`“${product?.name}” se eliminó.`);
    router.push("/admin/productos");
  };

  const totalUnits: number = state.colors.reduce(
    (sum: number, c: { name: string }): number =>
      sum + state.sizes.reduce((s: number, size: string): number => s + (Number(state.stock[stockKey(c.name, size)]) || 0), 0),
    0,
  );

  return (
    <div className="pb-24 lg:pb-0">
      <PageHeader
        back={
          <Link
            href="/admin/productos"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Productos
          </Link>
        }
        title={isNew ? "Nuevo producto" : state.name || "Producto sin nombre"}
        description={isNew ? "Completa los datos, las variantes y las fotos." : `${totalUnits} unidades en existencia`}
        actions={
          <div className="hidden gap-2 lg:flex">
            {!isNew && <DeleteButton onClick={(): void => setDeleteOpen(true)} />}
            {!isNew && product?.active && (
              <a
                href={`/tienda/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
              >
                Ver en la tienda
              </a>
            )}
            <SaveButton saving={saving} isNew={isNew} onClick={save} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          <Card title="Información general">
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  value={state.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>): void => patch({ name: e.target.value })}
                  aria-invalid={!!errors.name}
                  placeholder="Ej.: Camiseta TKF Negra"
                  className="h-10 text-base sm:text-sm"
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Descripción</FieldLabel>
                <Textarea
                  id="description"
                  rows={4}
                  value={state.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => patch({ description: e.target.value })}
                  aria-invalid={!!errors.description}
                  className="text-base sm:text-sm"
                />
                <FieldError>{errors.description}</FieldError>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.categoryId}>
                  <FieldLabel htmlFor="category">Categoría</FieldLabel>
                  <Select
                    items={categoryItems}
                    value={state.categoryId || null}
                    onValueChange={(v: string | null): void => patch({ categoryId: v ?? "" })}
                  >
                    <SelectTrigger id="category" aria-invalid={!!errors.categoryId} className="w-full data-[size=default]:h-10">
                      <SelectValue placeholder="Elige una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryItems.map(
                        (item: CategoryItem): ReactNode => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.categoryId}</FieldError>
                </Field>
                <Field data-invalid={!!errors.price}>
                  <FieldLabel htmlFor="price">Precio (₡)</FieldLabel>
                  <Input
                    id="price"
                    inputMode="numeric"
                    value={state.price}
                    onChange={(e: ChangeEvent<HTMLInputElement>): void =>
                      patch({ price: e.target.value.replace(/[^\d]/g, "") })
                    }
                    aria-invalid={!!errors.price}
                    placeholder="12000"
                    className="h-10 text-base tabular-nums sm:text-sm"
                  />
                  <FieldDescription>Con IVA incluido.</FieldDescription>
                  <FieldError>{errors.price}</FieldError>
                </Field>
              </div>
            </FieldGroup>
          </Card>

          <Card title="Variantes y existencias" description="Elige las tallas, agrega colores y escribe las unidades de cada combinación.">
            <VariantsSection state={state} errors={errors} onChange={patch} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Estado">
            <div className="space-y-4">
              <Label htmlFor="active" className="flex cursor-pointer items-start justify-between gap-4 font-normal">
                <span>
                  <span className="block text-sm font-medium">Visible en la tienda</span>
                  <span className="block text-sm text-muted-foreground">Si lo apagas, el producto se oculta.</span>
                </span>
                <Switch id="active" checked={state.active} onCheckedChange={(v: boolean): void => patch({ active: v })} />
              </Label>
              <Label htmlFor="featured" className="flex cursor-pointer items-start justify-between gap-4 font-normal">
                <span>
                  <span className="block text-sm font-medium">Destacado</span>
                  <span className="block text-sm text-muted-foreground">Aparece en la portada.</span>
                </span>
                <Switch id="featured" checked={state.featured} onCheckedChange={(v: boolean): void => patch({ featured: v })} />
              </Label>
            </div>
          </Card>

          <Card title="Imágenes" description="La primera es la portada del producto.">
            <ImagesSection
              images={images}
              colors={state.colors}
              error={errors.images}
              onChange={(next: EditorImage[]): void => {
                setImages(next);
                if (errors.images) setErrors((prev: EditorErrors): EditorErrors => ({ ...prev, images: undefined }));
              }}
            />
          </Card>
        </div>
      </div>

      {/* Barra de acciones fija en teléfono */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border/60 bg-background/90 p-3 backdrop-blur-md lg:hidden">
        {!isNew && <DeleteButton onClick={(): void => setDeleteOpen(true)} iconOnly />}
        <SaveButton saving={saving} isNew={isNew} onClick={save} className="flex-1" />
      </div>

      {!isNew && (
        <DeleteDialog name={product?.name ?? ""} open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={remove} />
      )}
    </div>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }): ReactNode {
  return (
    <section className="rounded-xl border border-border/60 bg-card/40 p-5">
      <h2 className="font-medium">{title}</h2>
      {description && <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

type SaveButtonProps = { saving: boolean; isNew: boolean; onClick: () => void; className?: string };

function SaveButton({ saving, isNew, onClick, className }: SaveButtonProps): ReactNode {
  return (
    <Button className={cn("h-10 px-5", className)} onClick={onClick} disabled={saving}>
      {saving && <LoaderCircleIcon className="animate-spin" />}
      {saving ? "Guardando…" : isNew ? "Crear producto" : "Guardar cambios"}
    </Button>
  );
}

type DeleteButtonProps = { onClick: () => void; iconOnly?: boolean };

function DeleteButton({ onClick, iconOnly = false }: DeleteButtonProps): ReactNode {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn("h-10 text-destructive hover:text-destructive", iconOnly ? "w-10 px-0" : "px-4")}
    >
      <Trash2Icon />
      {iconOnly ? <span className="sr-only">Eliminar producto</span> : "Eliminar"}
    </Button>
  );
}

type DeleteDialogProps = { name: string; open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void };

/** Un solo diálogo controlado, compartido por los botones de escritorio y teléfono. */
function DeleteDialog({ name, open, onOpenChange, onConfirm }: DeleteDialogProps): ReactNode {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Se quitará de la tienda junto con sus variantes y existencias. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Eliminar producto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
