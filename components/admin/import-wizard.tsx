"use client";

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileSpreadsheetIcon,
  LoaderCircleIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { type ChangeEvent, type DragEvent, type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCRC } from "@/lib/availability";
import {
  analyzeImport,
  type ImportResult,
  type ImportRow,
  TEMPLATE_COLUMNS,
  TEMPLATE_ROWS,
} from "@/lib/product-import";
import type { Category, Product } from "@/lib/schemas";
import { useOnHide } from "@/lib/use-navigation-reset";
import { cn } from "@/lib/utils";

type ImportWizardProps = { categories: Category[]; products: Product[] };

type Loaded = { fileName: string; result: ImportResult };

const ACCEPT: string = ".xlsx,.xls,.csv";
const MAX_FILE_MB: number = 5;
/** Simula la latencia de la importación. */
const IMPORT_DELAY_MS: number = 1200;

/** Lee la primera hoja de un Excel o un CSV como filas con encabezados. */
async function readSpreadsheet(file: File): Promise<Record<string, unknown>[]> {
  const XLSX: typeof import("xlsx") = await import("xlsx");
  const isCsv: boolean = /\.csv$/i.test(file.name);
  const workbook: import("xlsx").WorkBook = isCsv
    ? XLSX.read(await file.text(), { type: "string" })
    : XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet: import("xlsx").WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
}

function csvEscape(value: string | number): string {
  const text: string = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url: string = URL.createObjectURL(blob);
  const a: HTMLAnchorElement = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadTemplate(format: "xlsx" | "csv"): Promise<void> {
  const rows: (string | number)[][] = [TEMPLATE_COLUMNS, ...TEMPLATE_ROWS];
  if (format === "csv") {
    // BOM para que Excel respete las tildes al abrir el CSV.
    const csv: string = `﻿${rows.map((r: (string | number)[]): string => r.map(csvEscape).join(",")).join("\n")}`;
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "plantilla-productos-tkf.csv");
    return;
  }
  const XLSX: typeof import("xlsx") = await import("xlsx");
  const sheet: import("xlsx").WorkSheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = TEMPLATE_COLUMNS.map((c: string): { wch: number } => ({ wch: c === "descripcion" ? 40 : c === "producto" ? 24 : 14 }));
  const book: import("xlsx").WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Productos");
  XLSX.writeFile(book, "plantilla-productos-tkf.xlsx");
}

export function ImportWizard({ categories, products }: ImportWizardProps): ReactNode {
  const input: React.RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [reading, setReading] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const [onlyErrors, setOnlyErrors] = useState<boolean>(false);
  // Un arrastre interrumpido por la navegación no debe dejar la zona resaltada.
  useOnHide((): void => setDragging(false));

  const handleFile = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      toast.error("Sube un archivo de Excel (.xlsx) o CSV.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`El archivo supera los ${MAX_FILE_MB} MB.`);
      return;
    }
    setReading(true);
    try {
      const records: Record<string, unknown>[] = await readSpreadsheet(file);
      setLoaded({ fileName: file.name, result: analyzeImport(records, categories, products) });
      setOnlyErrors(false);
    } catch {
      toast.error("No pudimos leer el archivo. Revisa que no esté dañado o protegido.");
    } finally {
      setReading(false);
    }
  };

  const confirmImport = (): void => {
    if (!loaded) return;
    const { newProducts, updatedProducts, variants }: ImportResult["summary"] = loaded.result.summary;
    setImporting(true);
    window.setTimeout((): void => {
      setImporting(false);
      setLoaded(null);
      const parts: string[] = [];
      if (newProducts) parts.push(`${newProducts} ${newProducts === 1 ? "producto nuevo" : "productos nuevos"}`);
      if (updatedProducts) parts.push(`${updatedProducts} ${updatedProducts === 1 ? "actualizado" : "actualizados"}`);
      toast.success(`Importación lista: ${parts.join(" y ")} (${variants} variantes).`);
    }, IMPORT_DELAY_MS);
  };

  return (
    <div className="space-y-6">
      {!loaded ? (
        <>
          <div
            onDragOver={(e: DragEvent<HTMLDivElement>): void => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(): void => setDragging(false)}
            onDrop={(e: DragEvent<HTMLDivElement>): void => {
              e.preventDefault();
              setDragging(false);
              void handleFile(e.dataTransfer.files[0]);
            }}
            className={cn(
              "flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center transition-colors duration-150",
              dragging ? "border-primary bg-primary/5" : "border-input bg-card/30",
            )}
          >
            {reading ? (
              <LoaderCircleIcon className="size-8 animate-spin text-muted-foreground" />
            ) : (
              <FileSpreadsheetIcon className="size-8 text-muted-foreground" strokeWidth={1.5} />
            )}
            <div>
              <p className="font-medium">{reading ? "Leyendo el archivo…" : "Arrastra tu archivo aquí"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Excel (.xlsx) o CSV, hasta {MAX_FILE_MB} MB.</p>
            </div>
            <input
              ref={input}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                void handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button className="mt-1 h-10 gap-2 px-4" disabled={reading} onClick={(): void => input.current?.click()}>
              <UploadIcon />
              Elegir archivo
            </Button>
          </div>

          <section className="rounded-xl border border-border/60 bg-card/40 p-5">
            <h2 className="font-medium">¿Cómo preparo el archivo?</h2>
            <ul className="mt-3 space-y-1.5 text-pretty text-sm text-muted-foreground">
              <li>· Una fila por cada combinación de color y talla.</li>
              <li>· Las filas con el mismo nombre de producto se agrupan en un solo producto.</li>
              <li>
                · Columnas: <span className="text-foreground">{TEMPLATE_COLUMNS.join(", ")}</span>. La descripción y el SKU
                son opcionales.
              </li>
              <li>· Las tallas válidas son XS, S, M, L, XL, 2XL y Única. Las fotos se agregan después en cada producto.</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" className="h-10 gap-2 px-4" onClick={(): void => void downloadTemplate("xlsx")}>
                <DownloadIcon />
                Plantilla de Excel
              </Button>
              <Button variant="outline" className="h-10 gap-2 px-4" onClick={(): void => void downloadTemplate("csv")}>
                <DownloadIcon />
                Plantilla CSV
              </Button>
            </div>
          </section>
        </>
      ) : (
        <Preview
          loaded={loaded}
          onlyErrors={onlyErrors}
          setOnlyErrors={setOnlyErrors}
          importing={importing}
          onCancel={(): void => setLoaded(null)}
          onConfirm={confirmImport}
        />
      )}
    </div>
  );
}

type PreviewProps = {
  loaded: Loaded;
  onlyErrors: boolean;
  setOnlyErrors: (value: boolean) => void;
  importing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function Preview({ loaded, onlyErrors, setOnlyErrors, importing, onCancel, onConfirm }: PreviewProps): ReactNode {
  const { result, fileName }: Loaded = loaded;
  const { summary }: ImportResult = result;
  const rows: ImportRow[] = onlyErrors ? result.rows.filter((r: ImportRow): boolean => r.errors.length > 0) : result.rows;
  const canImport: boolean = result.fileErrors.length === 0 && result.products.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3">
        <p className="flex min-w-0 items-center gap-2 text-sm">
          <FileSpreadsheetIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{fileName}</span>
        </p>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={importing} className="gap-1.5">
          <XIcon />
          Elegir otro archivo
        </Button>
      </div>

      {result.fileErrors.length > 0 ? (
        <div role="alert" className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
          <ul className="space-y-1">
            {result.fileErrors.map(
              (e: string): ReactNode => (
                <li key={e}>{e}</li>
              ),
            )}
          </ul>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Productos nuevos" value={summary.newProducts} />
            <Stat label="Productos a actualizar" value={summary.updatedProducts} />
            <Stat label="Variantes" value={summary.variants} hint={`${summary.units} unidades`} />
            <Stat
              label="Filas con errores"
              value={summary.invalidRows}
              tone={summary.invalidRows > 0 ? "warning" : "success"}
              hint={`de ${summary.totalRows} filas`}
            />
          </dl>

          {summary.newCategories.length > 0 && (
            <p className="rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
              Se crearán las categorías: <span className="text-foreground">{summary.newCategories.join(", ")}</span>.
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <h2 className="font-medium">Vista previa</h2>
            {summary.invalidRows > 0 && (
              <Label htmlFor="only-errors" className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                <Checkbox id="only-errors" checked={onlyErrors} onCheckedChange={(v: boolean): void => setOnlyErrors(v)} />
                Solo filas con errores
              </Label>
            )}
          </div>

          <div className="max-h-[28rem] overflow-auto overscroll-contain rounded-xl border border-border/60">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-14 pl-4">Fila</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Talla</TableHead>
                  <TableHead className="text-right">Exist.</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="pr-4">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: ImportRow): ReactNode => {
                  const ok: boolean = row.errors.length === 0;
                  return (
                    <TableRow key={row.line} className={cn(!ok && "bg-destructive/5")}>
                      <TableCell className="pl-4 text-muted-foreground tabular-nums">{row.line}</TableCell>
                      <TableCell className="max-w-48 truncate font-medium">{row.product || "—"}</TableCell>
                      <TableCell>{row.color || "—"}</TableCell>
                      <TableCell>{row.size ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.stock ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.price ? formatCRC(row.price) : "—"}</TableCell>
                      <TableCell className="pr-4">
                        {ok ? (
                          <span className="inline-flex items-center gap-1.5 text-success">
                            <CheckCircle2Icon className="size-4" />
                            Lista
                          </span>
                        ) : (
                          <span className="flex items-start gap-1.5 whitespace-normal text-destructive">
                            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                            <span>{row.errors.join(" ")}</span>
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" className="h-10 px-4" onClick={onCancel} disabled={importing}>
          Cancelar
        </Button>
        <Button className="h-10 gap-2 px-5" onClick={onConfirm} disabled={!canImport || importing}>
          {importing && <LoaderCircleIcon className="animate-spin" />}
          {importing
            ? "Importando…"
            : summary.invalidRows > 0
              ? `Importar ${summary.validRows} filas válidas`
              : `Importar ${result.products.length} ${result.products.length === 1 ? "producto" : "productos"}`}
        </Button>
      </div>
    </div>
  );
}

type StatProps = { label: string; value: number; hint?: string; tone?: "default" | "success" | "warning" };

function Stat({ label, value, hint, tone = "default" }: StatProps): ReactNode {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </dd>
      {hint && <dd className="text-xs text-muted-foreground">{hint}</dd>}
    </div>
  );
}
