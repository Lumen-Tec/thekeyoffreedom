"use client";

import { AlertTriangleIcon, PackageSearchIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ChangeEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCRC, LOW_STOCK_THRESHOLD, totalStock } from "@/lib/availability";
import type { Category, Product, Variant } from "@/lib/schemas";
import { normalize } from "@/lib/text";
import { cn } from "@/lib/utils";

type ProductsTableProps = { products: Product[]; categories: Category[] };

type SelectItemData = { value: string; label: string };

const ALL: string = "todas";

type StockSummary = { total: number; out: number; low: number };

function stockSummary(product: Product): StockSummary {
  return {
    total: totalStock(product.variants),
    out: product.variants.filter((v: Variant): boolean => v.stock === 0).length,
    low: product.variants.filter((v: Variant): boolean => v.stock > 0 && v.stock <= LOW_STOCK_THRESHOLD).length,
  };
}

export function ProductsTable({ products, categories }: ProductsTableProps): ReactNode {
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>(ALL);
  // Estado local para que el interruptor responda; no se guarda.
  const [activeById, setActiveById] = useState<Record<string, boolean>>(
    Object.fromEntries(products.map((p: Product): [string, boolean] => [p.id, p.active])),
  );

  const categoryName = (id: string): string => categories.find((c: Category): boolean => c.id === id)?.name ?? "—";
  const categoryItems: SelectItemData[] = [
    { value: ALL, label: "Todas las categorías" },
    ...categories.map((c: Category): SelectItemData => ({ value: c.id, label: c.name })),
  ];

  const terms: string[] = normalize(search).split(/\s+/).filter(Boolean);
  const visible: Product[] = products.filter((p: Product): boolean => {
    if (category !== ALL && p.categoryId !== category) return false;
    const haystack: string = normalize(`${p.name} ${p.variants.map((v: Variant): string => v.sku).join(" ")}`);
    return terms.every((t: string): boolean => haystack.includes(t));
  });

  const toggleActive = (product: Product, active: boolean): void => {
    setActiveById((prev: Record<string, boolean>): Record<string, boolean> => ({ ...prev, [product.id]: active }));
    toast.success(active ? `“${product.name}” ahora se muestra en la tienda.` : `“${product.name}” quedó oculto en la tienda.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:max-w-xs sm:flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Buscar productos"
            placeholder="Buscar por nombre o SKU…"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)}
            className="h-10 pl-9 text-base sm:text-sm"
          />
        </div>
        <Select items={categoryItems} value={category} onValueChange={(v: string | null): void => setCategory(v ?? ALL)}>
          <SelectTrigger aria-label="Filtrar por categoría" className="data-[size=default]:h-10 sm:min-w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map(
              (item: SelectItemData): ReactNode => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground sm:ml-auto sm:self-center">
          {visible.length} de {products.length} productos
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <PackageSearchIcon className="size-8 text-muted-foreground/70" strokeWidth={1.5} />
          <p className="font-medium">Ningún producto coincide</p>
          <p className="text-sm text-muted-foreground">Prueba con otro nombre o cambia la categoría.</p>
        </div>
      ) : (
        <>
          {/* Escritorio: tabla */}
          <div className="hidden overflow-hidden rounded-xl border border-border/60 md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[45%] pl-4">Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Existencias</TableHead>
                  <TableHead className="pr-4 text-right">Visible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((p: Product): ReactNode => {
                  const stock: StockSummary = stockSummary(p);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="pl-4">
                        <Link href={`/admin/productos/${p.id}`} className="group flex items-center gap-3">
                          <span className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted outline outline-1 -outline-offset-1 outline-white/10">
                            <Image src={p.images[0].src} alt="" fill sizes="44px" className="object-cover" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium group-hover:underline">{p.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {p.variants.length} {p.variants.length === 1 ? "variante" : "variantes"}
                            </span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{categoryName(p.categoryId)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCRC(p.price)}</TableCell>
                      <TableCell className="text-right">
                        <StockCell stock={stock} />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Switch
                          checked={activeById[p.id]}
                          onCheckedChange={(checked: boolean): void => toggleActive(p, checked)}
                          aria-label={`Mostrar ${p.name} en la tienda`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Teléfono: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {visible.map((p: Product): ReactNode => {
              const stock: StockSummary = stockSummary(p);
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
                  <Link href={`/admin/productos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted outline outline-1 -outline-offset-1 outline-white/10">
                      <Image src={p.images[0].src} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {categoryName(p.categoryId)} · {formatCRC(p.price)}
                      </span>
                      <StockCell stock={stock} align="left" />
                    </span>
                  </Link>
                  <Switch
                    checked={activeById[p.id]}
                    onCheckedChange={(checked: boolean): void => toggleActive(p, checked)}
                    aria-label={`Mostrar ${p.name} en la tienda`}
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function StockCell({ stock, align = "right" }: { stock: StockSummary; align?: "left" | "right" }): ReactNode {
  return (
    <span className={cn("inline-flex flex-col gap-0.5", align === "right" ? "items-end" : "items-start")}>
      <span className={cn("tabular-nums", stock.total === 0 && "text-muted-foreground")}>
        {stock.total === 0 ? "Agotado" : `${stock.total} u.`}
      </span>
      {stock.out > 0 && stock.total > 0 && (
        <span className="inline-flex items-center gap-1 text-xs text-warning">
          <AlertTriangleIcon className="size-3" />
          {stock.out} {stock.out === 1 ? "variante agotada" : "variantes agotadas"}
        </span>
      )}
      {stock.out === 0 && stock.low > 0 && (
        <span className="text-xs text-muted-foreground">
          {stock.low} con pocas unidades
        </span>
      )}
    </span>
  );
}
