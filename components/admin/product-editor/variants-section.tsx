"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { type ChangeEvent, type FormEvent, type ReactNode, useState } from "react";
import { type EditorErrors, type EditorState, stockKey } from "@/components/admin/product-editor/editor-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOW_STOCK_THRESHOLD } from "@/lib/availability";
import { SIZES, type Color, type Size } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type VariantsSectionProps = {
  state: EditorState;
  errors: EditorErrors;
  onChange: (changes: Partial<EditorState>) => void;
};

const DEFAULT_HEX: string = "#161616";

export function VariantsSection({ state, errors, onChange }: VariantsSectionProps): ReactNode {
  const [colorName, setColorName] = useState<string>("");
  const [colorHex, setColorHex] = useState<string>(DEFAULT_HEX);
  const [colorError, setColorError] = useState<string | null>(null);

  const toggleSize = (size: Size): void => {
    const sizes: Size[] = state.sizes.includes(size)
      ? state.sizes.filter((s: Size): boolean => s !== size)
      : SIZES.filter((s: Size): boolean => s === size || state.sizes.includes(s));
    onChange({ sizes });
  };

  const addColor = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const name: string = colorName.trim();
    if (!name) {
      setColorError("Escribe el nombre del color.");
      return;
    }
    if (state.colors.some((c: Color): boolean => c.name.toLowerCase() === name.toLowerCase())) {
      setColorError("Ese color ya está en la lista.");
      return;
    }
    onChange({ colors: [...state.colors, { name, hex: colorHex }] });
    setColorName("");
    setColorHex(DEFAULT_HEX);
    setColorError(null);
  };

  const removeColor = (name: string): void => {
    onChange({ colors: state.colors.filter((c: Color): boolean => c.name !== name) });
  };

  const setStock = (color: string, size: Size, value: string): void => {
    onChange({ stock: { ...state.stock, [stockKey(color, size)]: value.replace(/[^\d]/g, "") } });
  };

  return (
    <div className="space-y-6">
      {/* Tallas */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Tallas</legend>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size: Size): ReactNode => {
            const selected: boolean = state.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                aria-pressed={selected}
                onClick={(): void => toggleSize(size)}
                className={cn(
                  "h-9 min-w-11 rounded-md border px-3 text-sm font-medium transition-colors duration-150",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-input/20 hover:bg-input/50",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
        {errors.sizes && <p className="mt-2 text-sm text-destructive">{errors.sizes}</p>}
      </fieldset>

      {/* Agregar color */}
      <form onSubmit={addColor} className="space-y-2" noValidate>
        <label htmlFor="new-color" className="text-sm font-medium">
          Agregar color
        </label>
        <div className="flex gap-2">
          <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input">
            <span className="sr-only">Muestra del color</span>
            <input
              type="color"
              value={colorHex}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setColorHex(e.target.value)}
              className="absolute -inset-2 size-14 cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
          <Input
            id="new-color"
            value={colorName}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => {
              setColorName(e.target.value);
              setColorError(null);
            }}
            placeholder="Ej.: Azul marino"
            aria-invalid={!!colorError || !!errors.colors}
            className="h-10 text-base sm:text-sm"
          />
          <Button type="submit" variant="outline" className="h-10 gap-1.5 px-3">
            <PlusIcon />
            Agregar
          </Button>
        </div>
        {(colorError ?? errors.colors) && <p className="text-sm text-destructive">{colorError ?? errors.colors}</p>}
      </form>

      {/* Matriz de existencias */}
      {state.colors.length > 0 && state.sizes.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full min-w-max text-sm">
            <caption className="sr-only">Existencias por color y talla</caption>
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  Color
                </th>
                {state.sizes.map(
                  (size: Size): ReactNode => (
                    <th key={size} scope="col" className="px-2 py-2 text-center font-medium">
                      {size}
                    </th>
                  ),
                )}
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {state.colors.map((color: Color): ReactNode => {
                const total: number = state.sizes.reduce(
                  (sum: number, s: Size): number => sum + (Number(state.stock[stockKey(color.name, s)]) || 0),
                  0,
                );
                return (
                  <tr key={color.name} className="border-b border-border/60 last:border-0">
                    <th scope="row" className="px-3 py-2 text-left font-normal">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-4 shrink-0 rounded-full border border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="whitespace-nowrap">{color.name}</span>
                        <button
                          type="button"
                          onClick={(): void => removeColor(color.name)}
                          className="ml-auto flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                        >
                          <XIcon className="size-3.5" />
                          <span className="sr-only">Quitar {color.name}</span>
                        </button>
                      </span>
                    </th>
                    {state.sizes.map((size: Size): ReactNode => {
                      const value: string = state.stock[stockKey(color.name, size)] ?? "";
                      const n: number = Number(value || "0");
                      return (
                        <td key={size} className="px-1 py-1.5">
                          <Input
                            inputMode="numeric"
                            value={value}
                            placeholder="0"
                            onChange={(e: ChangeEvent<HTMLInputElement>): void => setStock(color.name, size, e.target.value)}
                            aria-label={`Existencias de ${color.name}, talla ${size}`}
                            className={cn(
                              "mx-auto h-9 w-14 px-1 text-center text-base tabular-nums sm:text-sm",
                              n === 0 && "text-muted-foreground",
                              n > 0 && n <= LOW_STOCK_THRESHOLD && "border-warning/50 text-warning",
                            )}
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {errors.stock && <p className="text-sm text-destructive">{errors.stock}</p>}
      {state.colors.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Las cantidades en amarillo ({LOW_STOCK_THRESHOLD} o menos) se muestran en la tienda como “Últimas unidades”; en
          0, como agotadas.
        </p>
      )}
    </div>
  );
}
