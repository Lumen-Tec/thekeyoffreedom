"use client";

import { ArrowDownIcon, ArrowUpIcon, CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { type ChangeEvent, type FormEvent, type KeyboardEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnHide } from "@/lib/use-navigation-reset";

export type CategoryRow = { id: string; name: string; productCount: number };

/** Mensaje de validación del nombre, o `null` si es válido. */
function nameError(name: string, rows: CategoryRow[], exceptId?: string): string | null {
  const trimmed: string = name.trim();
  if (trimmed.length < 2) return "Escribe un nombre de al menos 2 caracteres.";
  const taken: boolean = rows.some(
    (r: CategoryRow): boolean => r.id !== exceptId && r.name.toLowerCase() === trimmed.toLowerCase(),
  );
  return taken ? "Ya existe una categoría con ese nombre." : null;
}

/**
 * Los cambios se reflejan en pantalla durante la sesión para que la gestión
 * se sienta real; no se guardan.
 */
export function CategoriesManager({ initial }: { initial: CategoryRow[] }): ReactNode {
  const [rows, setRows] = useState<CategoryRow[]>(initial);
  const [newName, setNewName] = useState<string>("");
  const [newError, setNewError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editError, setEditError] = useState<string | null>(null);

  // Al salir se descarta una edición a medias y los mensajes de error, para
  // que no reaparezcan al volver (Next.js conserva el estado de la página).
  useOnHide((): void => {
    setEditingId(null);
    setEditError(null);
    setNewError(null);
  });

  const create = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const error: string | null = nameError(newName, rows);
    if (error) {
      setNewError(error);
      return;
    }
    const name: string = newName.trim();
    setRows([...rows, { id: `cat-${Date.now()}`, name, productCount: 0 }]);
    setNewName("");
    toast.success(`Categoría “${name}” creada.`);
  };

  const startEdit = (row: CategoryRow): void => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditError(null);
  };

  const saveEdit = (row: CategoryRow): void => {
    const error: string | null = nameError(editName, rows, row.id);
    if (error) {
      setEditError(error);
      return;
    }
    const name: string = editName.trim();
    setRows(rows.map((r: CategoryRow): CategoryRow => (r.id === row.id ? { ...r, name } : r)));
    setEditingId(null);
    if (name !== row.name) toast.success(`Categoría renombrada a “${name}”.`);
  };

  const move = (index: number, delta: number): void => {
    const next: CategoryRow[] = [...rows];
    const [item]: CategoryRow[] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setRows(next);
    toast.success("Orden actualizado.");
  };

  const remove = (row: CategoryRow): void => {
    setRows(rows.filter((r: CategoryRow): boolean => r.id !== row.id));
    toast.success(`Categoría “${row.name}” eliminada.`);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={create} noValidate className="rounded-xl border border-border/60 bg-card/40 p-5">
        <label htmlFor="new-category" className="text-sm font-medium">
          Nueva categoría
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id="new-category"
            value={newName}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
              setNewName(e.target.value);
              setNewError(null);
            }}
            placeholder="Ej.: Sudaderas"
            aria-invalid={!!newError}
            className="h-10 text-base sm:text-sm"
          />
          <Button type="submit" className="h-10 gap-1.5 px-4">
            <PlusIcon />
            Crear
          </Button>
        </div>
        {newError && <p className="mt-2 text-sm text-destructive">{newError}</p>}
      </form>

      <ol className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
        {rows.map((row: CategoryRow, index: number): ReactNode => {
          const editing: boolean = editingId === row.id;
          return (
            <li key={row.id} className="flex items-center gap-3 bg-card/20 px-4 py-3">
              <span className="w-5 text-sm text-muted-foreground tabular-nums">{index + 1}</span>
              <div className="min-w-0 flex-1">
                {editing ? (
                  <>
                    <Input
                      autoFocus
                      aria-label={`Nuevo nombre para ${row.name}`}
                      value={editName}
                      onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                        setEditName(e.target.value);
                        setEditError(null);
                      }}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>): void => {
                        if (e.key === "Enter") saveEdit(row);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      aria-invalid={!!editError}
                      className="h-9 text-base sm:text-sm"
                    />
                    {editError && <p className="mt-1 text-xs text-destructive">{editError}</p>}
                  </>
                ) : (
                  <>
                    <p className="truncate font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.productCount === 0
                        ? "Sin productos"
                        : `${row.productCount} ${row.productCount === 1 ? "producto" : "productos"}`}
                    </p>
                  </>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                {editing ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={(): void => saveEdit(row)} aria-label="Guardar nombre">
                      <CheckIcon />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(): void => setEditingId(null)} aria-label="Cancelar">
                      <XIcon />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" disabled={index === 0} onClick={(): void => move(index, -1)} aria-label={`Subir ${row.name}`}>
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === rows.length - 1}
                      onClick={(): void => move(index, 1)}
                      aria-label={`Bajar ${row.name}`}
                    >
                      <ArrowDownIcon />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(): void => startEdit(row)} aria-label={`Renombrar ${row.name}`}>
                      <PencilIcon />
                    </Button>
                    <DeleteCategory row={row} onConfirm={(): void => remove(row)} />
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DeleteCategory({ row, onConfirm }: { row: CategoryRow; onConfirm: () => void }): ReactNode {
  const blocked: boolean = row.productCount > 0;
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" />}>
        <Trash2Icon />
        <span className="sr-only">Eliminar {row.name}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{blocked ? `“${row.name}” tiene productos` : `¿Eliminar “${row.name}”?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `Mueve sus ${row.productCount} productos a otra categoría antes de eliminarla.`
              : "La categoría dejará de aparecer en la tienda. Esta acción no se puede deshacer."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {blocked ? (
            <AlertDialogCancel>Entendido</AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onConfirm}>
                Eliminar categoría
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
