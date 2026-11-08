import type { Catalog, Category, Color, Product, ProductImage, Size, Variant } from "@/lib/schemas";
import { slugify } from "@/lib/text";

/**
 * Catálogo semilla. Las fotos vienen de las publicaciones de la marca y
 * las existencias están elegidas para mostrar los tres estados de
 * disponibilidad (disponible, últimas unidades y agotado).
 */

const C = {
  blanco: { name: "Blanco", hex: "#F4F4F2" },
  negro: { name: "Negro", hex: "#161616" },
  rojo: { name: "Rojo", hex: "#C8302F" },
  amarillo: { name: "Amarillo", hex: "#E9C33A" },
  verdeMenta: { name: "Verde menta", hex: "#9ED9A0" },
  grisCarbon: { name: "Gris carbón", hex: "#3E3F43" },
  azulMarino: { name: "Azul marino", hex: "#1F2A44" },
  grisJaspe: { name: "Gris jaspe", hex: "#B9B9B6" },
  vino: { name: "Vino", hex: "#6E2B35" },
  verdeOliva: { name: "Verde oliva", hex: "#3F6B3A" },
  amarilloPastel: { name: "Amarillo pastel", hex: "#F2E08A" },
  celeste: { name: "Celeste", hex: "#9FCBE6" },
  gris: { name: "Gris", hex: "#D7D8D6" },
  rojoNegro: { name: "Rojo y negro", hex: "#C62828" },
  crema: { name: "Crema", hex: "#E8DFC4" },
  verde: { name: "Verde", hex: "#2E9B3B" },
  camuflaje: { name: "Camuflaje", hex: "#6B6A4A" },
  rosa: { name: "Rosa", hex: "#F2AFC4" },
} satisfies Record<string, Color>;

/** Existencias de una variante según su color y talla. */
type StockFn = (color: Color, size: Size) => number;

/** Genera las variantes color × talla de un producto. */
function variants(productId: string, skuPrefix: string, colors: Color[], sizes: Size[], stock: StockFn): Variant[] {
  return colors.flatMap((color: Color): Variant[] =>
    sizes.map((size: Size): Variant => {
      const colorCode: string = slugify(color.name).slice(0, 3).toUpperCase();
      const sizeCode: string = size === "Única" ? "U" : size;
      return {
        id: `${productId}-${slugify(color.name)}-${slugify(size)}`,
        sku: `${skuPrefix}-${colorCode}-${sizeCode}`,
        color,
        size,
        stock: stock(color, size),
      };
    }),
  );
}

function img(file: string, alt: string, color?: string): ProductImage {
  return { src: `/products/${file}.webp`, alt, ...(color ? { color } : {}) };
}

/** Existencias "típicas" con un poco de variación, por talla. */
const typical: Record<Size, number> = { XS: 4, S: 8, M: 12, L: 10, XL: 6, "2XL": 4, Única: 9 };

const TEE_DESCRIPTION: string =
  "Camiseta de algodón 100% con la llave de The Key of Freedom bordada en el pecho. Fresca, cómoda y pensada para el día a día: para salir, aguantar el calor o el frío y recordarte que sí se pueden ganar las batallas.";
const BLOUSE_DESCRIPTION: string =
  "Blusa de algodón 100% de nuestra colección Para Ellas, con corte entallado y la llave bordada. Suave, fresca y con el detalle de la marca que la hace única.";
const CAP_DESCRIPTION: string =
  "Gorra con el logo bordado de The Key of Freedom y cierre ajustable atrás. Talla única para hombre y mujer.";

export const categories: Category[] = [
  { id: "cat-camisetas", slug: "camisetas", name: "Camisetas", description: "Algodón 100% con la llave bordada.", position: 0 },
  { id: "cat-para-ellas", slug: "para-ellas", name: "Para Ellas", description: "Blusas de corte entallado.", position: 1 },
  { id: "cat-gorras", slug: "gorras", name: "Gorras", description: "Usa la llave en tu cabeza.", position: 2 },
];

const TEE_SIZES: Size[] = ["S", "M", "L", "XL"];
const BLOUSE_SIZES: Size[] = ["S", "M", "L"];
/** La roja muestra "últimas unidades" en L y "agotado" en XL. */
const RED_TEE_STOCK: Partial<Record<Size, number>> = { S: 6, M: 5, L: 2, XL: 0 };

export const products: Product[] = [
  // ── Camisetas ──────────────────────────────────────────────
  {
    id: "p-camiseta-clasica",
    slug: "camiseta-clasica-tkf",
    name: "Camiseta Clásica TKF",
    description: TEE_DESCRIPTION,
    categoryId: "cat-camisetas",
    price: 12000,
    active: true,
    featured: true,
    createdAt: "2026-10-20",
    images: [
      img("camiseta-clasica-blanco-1", "Camiseta Clásica TKF blanca, vista frontal", "Blanco"),
      img("camiseta-clasica-blanco-2", "Modelo con la Camiseta Clásica TKF blanca frente a un grafiti", "Blanco"),
      img("camiseta-clasica-negro-1", "Camiseta Clásica TKF negra, vista frontal", "Negro"),
      img("camiseta-clasica-negro-2", "Modelo con la Camiseta Clásica TKF negra junto al mar", "Negro"),
      img("camiseta-clasica-rojo-1", "Camiseta Clásica TKF roja, vista frontal", "Rojo"),
      img("camiseta-clasica-rojo-2", "Modelo con la Camiseta Clásica TKF roja sobre fondo azul", "Rojo"),
    ],
    variants: [
      ...variants("p-camiseta-clasica", "TKF-CAM-CLA", [C.blanco, C.negro], [...TEE_SIZES, "2XL"], (_c: Color, s: Size): number => typical[s]),
      ...variants("p-camiseta-clasica", "TKF-CAM-CLA", [C.rojo], TEE_SIZES, (_c: Color, s: Size): number => RED_TEE_STOCK[s] ?? 0),
    ],
  },
  {
    id: "p-camiseta-amarilla",
    slug: "camiseta-tkf-amarilla",
    name: "Camiseta TKF Amarilla",
    description: TEE_DESCRIPTION,
    categoryId: "cat-camisetas",
    price: 12000,
    active: true,
    featured: true,
    createdAt: "2026-09-02",
    images: [
      img("camiseta-mostaza-1", "Camiseta TKF amarilla, vista frontal"),
      img("camiseta-mostaza-2", "Modelo con la Camiseta TKF amarilla en la calle"),
      img("camiseta-mostaza-3", "Pareja con camisetas TKF amarillas frente al mar"),
    ],
    variants: variants("p-camiseta-amarilla", "TKF-CAM-AMA", [C.amarillo], TEE_SIZES, (_c: Color, s: Size): number => typical[s]),
  },
  {
    id: "p-camiseta-verde-menta",
    slug: "camiseta-tkf-verde-menta",
    name: "Camiseta TKF Verde Menta",
    description: TEE_DESCRIPTION,
    categoryId: "cat-camisetas",
    price: 12000,
    active: true,
    featured: true,
    createdAt: "2026-08-14",
    images: [
      img("camiseta-verde-menta-1", "Camiseta TKF verde menta, vista frontal"),
      img("camiseta-verde-menta-2", "Modelo con la Camiseta TKF verde menta frente a un grafiti"),
      img("camiseta-verde-menta-3", "Modelo sonriendo con la Camiseta TKF verde menta"),
    ],
    variants: variants("p-camiseta-verde-menta", "TKF-CAM-VME", [C.verdeMenta], TEE_SIZES, (_c: Color, s: Size): number => (s === "M" ? 1 : typical[s])),
  },
  {
    id: "p-camiseta-gris-carbon",
    slug: "camiseta-tkf-gris-carbon",
    name: "Camiseta TKF Gris Carbón",
    description: TEE_DESCRIPTION,
    categoryId: "cat-camisetas",
    price: 12000,
    active: true,
    featured: false,
    createdAt: "2026-07-05",
    images: [
      img("camiseta-gris-carbon-1", "Modelo con la Camiseta TKF gris carbón sobre fondo rosado"),
      img("camiseta-gris-carbon-2", "Modelo con la Camiseta TKF gris carbón sobre fondo morado"),
    ],
    variants: variants("p-camiseta-gris-carbon", "TKF-CAM-GCA", [C.grisCarbon], TEE_SIZES, (_c: Color, s: Size): number => typical[s]),
  },
  {
    id: "p-camiseta-azul-marino",
    slug: "camiseta-tkf-azul-marino",
    name: "Camiseta TKF Azul Marino",
    description: TEE_DESCRIPTION,
    categoryId: "cat-camisetas",
    price: 12000,
    active: true,
    featured: false,
    createdAt: "2026-06-18",
    images: [img("camiseta-azul-marino-1", "Modelo con la Camiseta TKF azul marino sobre fondo verde")],
    variants: variants("p-camiseta-azul-marino", "TKF-CAM-AZM", [C.azulMarino], TEE_SIZES, (_c: Color, s: Size): number => typical[s]),
  },
  {
    id: "p-camiseta-edicion-2xl",
    slug: "camiseta-tkf-edicion-2xl",
    name: "Camiseta TKF Edición 2XL",
    description:
      "Edición especial disponible únicamente en talla 2XL, en cuatro colores. Algodón 100% con la llave bordada en el pecho.",
    categoryId: "cat-camisetas",
    price: 12000,
    active: true,
    featured: false,
    createdAt: "2026-05-30",
    images: [img("camiseta-edicion-2xl-1", "Camisetas TKF Edición 2XL en gris, vino, verde oliva y amarillo pastel")],
    variants: variants(
      "p-camiseta-edicion-2xl",
      "TKF-CAM-2XL",
      [C.grisJaspe, C.vino, C.verdeOliva, C.amarilloPastel],
      ["2XL"],
      (c: Color): number => (c.name === "Vino" ? 1 : 5),
    ),
  },

  // ── Para Ellas ─────────────────────────────────────────────
  {
    id: "p-blusa-celeste",
    slug: "blusa-tkf-celeste",
    name: "Blusa TKF Celeste",
    description: BLOUSE_DESCRIPTION,
    categoryId: "cat-para-ellas",
    price: 12000,
    active: true,
    featured: true,
    createdAt: "2026-10-28",
    images: [
      img("blusa-celeste-1", "Modelo con la Blusa TKF celeste"),
      img("blusa-celeste-2", "Modelo con la Blusa TKF celeste frente a un mural"),
      img("blusa-celeste-3", "Modelo posando con la Blusa TKF celeste"),
    ],
    variants: variants("p-blusa-celeste", "TKF-BLU-CEL", [C.celeste], BLOUSE_SIZES, (_c: Color, s: Size): number => typical[s]),
  },
  {
    id: "p-blusa-blanca",
    slug: "blusa-tkf-blanca",
    name: "Blusa TKF Blanca",
    description: BLOUSE_DESCRIPTION,
    categoryId: "cat-para-ellas",
    price: 12000,
    active: true,
    featured: false,
    createdAt: "2026-09-12",
    images: [
      img("blusa-blanca-1", "Modelo con la Blusa TKF blanca frente a un grafiti"),
      img("blusa-blanca-2", "Modelo con la Blusa TKF blanca"),
      img("blusa-blanca-3", "Espalda de la Blusa TKF blanca con el logo TKF"),
    ],
    variants: variants("p-blusa-blanca", "TKF-BLU-BLA", [C.blanco], BLOUSE_SIZES, (_c: Color, s: Size): number => typical[s]),
  },
  {
    id: "p-blusa-negra",
    slug: "blusa-tkf-negra",
    name: "Blusa TKF Negra",
    description: BLOUSE_DESCRIPTION,
    categoryId: "cat-para-ellas",
    price: 12000,
    active: true,
    featured: false,
    createdAt: "2026-08-01",
    images: [
      img("blusa-negra-1", "Modelo con la Blusa TKF negra y un balón de baloncesto"),
      img("blusa-negra-2", "Modelo con la Blusa TKF negra en una cancha"),
      img("blusa-negra-3", "Modelo con la Blusa TKF negra y gorra rosa"),
    ],
    variants: variants("p-blusa-negra", "TKF-BLU-NEG", [C.negro], BLOUSE_SIZES, (_c: Color, s: Size): number => (s === "M" ? 0 : typical[s])),
  },
  {
    id: "p-blusa-amarilla",
    slug: "blusa-tkf-amarilla",
    name: "Blusa TKF Amarilla",
    description: BLOUSE_DESCRIPTION,
    categoryId: "cat-para-ellas",
    price: 12000,
    active: true,
    featured: true,
    createdAt: "2026-07-22",
    images: [
      img("blusa-amarilla-1", "Modelo sentada con la Blusa TKF amarilla"),
      img("blusa-amarilla-2", "Modelo con la Blusa TKF amarilla junto a un árbol"),
      img("blusa-amarilla-3", "Modelo con la Blusa TKF amarilla frente al mar"),
    ],
    variants: variants("p-blusa-amarilla", "TKF-BLU-AMA", [C.amarillo], BLOUSE_SIZES, (_c: Color, s: Size): number => typical[s]),
  },

  // ── Gorras ─────────────────────────────────────────────────
  {
    id: "p-gorra-malla",
    slug: "gorra-malla-tkf",
    name: "Gorra Malla TKF",
    description: `${CAP_DESCRIPTION} Parte trasera de malla para mayor frescura.`,
    categoryId: "cat-gorras",
    price: 15000,
    active: true,
    featured: true,
    createdAt: "2026-10-10",
    images: [
      img("gorra-malla-gris-1", "Gorra Malla TKF gris con logo TKF bordado", "Gris"),
      img("gorra-malla-rojo-1", "Gorra Malla TKF roja y negra con la llave bordada", "Rojo y negro"),
      img("gorra-malla-celeste-1", "Gorra Malla TKF celeste con la llave bordada", "Celeste"),
      img("gorra-malla-crema-1", "Gorra Malla TKF crema con logo TKF bordado", "Crema"),
    ],
    variants: variants("p-gorra-malla", "TKF-GOR-MAL", [C.gris, C.rojoNegro, C.celeste, C.crema], ["Única"], (c: Color): number =>
      c.name === "Celeste" ? 3 : 9,
    ),
  },
  {
    id: "p-gorra-roja",
    slug: "gorra-tkf-roja",
    name: "Gorra TKF Roja",
    description: CAP_DESCRIPTION,
    categoryId: "cat-gorras",
    price: 15000,
    active: true,
    featured: false,
    createdAt: "2026-09-20",
    images: [img("gorra-tkf-roja-1", "Gorra TKF roja con la llave bordada")],
    variants: variants("p-gorra-roja", "TKF-GOR-ROJ", [C.rojo], ["Única"], (): number => 7),
  },
  {
    id: "p-gorra-verde",
    slug: "gorra-tkf-verde",
    name: "Gorra TKF Verde",
    description: CAP_DESCRIPTION,
    categoryId: "cat-gorras",
    price: 15000,
    active: true,
    featured: true,
    createdAt: "2026-09-05",
    images: [img("gorra-tkf-verde-1", "Gorra TKF verde con la llave bordada")],
    variants: variants("p-gorra-verde", "TKF-GOR-VER", [C.verde], ["Única"], (): number => 8),
  },
  {
    id: "p-gorra-camuflaje",
    slug: "gorra-tkf-camuflaje",
    name: "Gorra TKF Camuflaje",
    description: CAP_DESCRIPTION,
    categoryId: "cat-gorras",
    price: 15000,
    active: true,
    featured: false,
    createdAt: "2026-06-02",
    images: [
      img("gorra-camuflaje-1", "Dos gorras TKF camuflaje sobre un muro"),
      img("gorra-camuflaje-2", "Detalle de la gorra TKF camuflaje con la llave bordada"),
    ],
    variants: variants("p-gorra-camuflaje", "TKF-GOR-CAM", [C.camuflaje], ["Única"], (): number => 2),
  },
  {
    id: "p-gorra-rosa",
    slug: "gorra-tkf-rosa",
    name: "Gorra TKF Rosa",
    description: CAP_DESCRIPTION,
    categoryId: "cat-gorras",
    price: 15000,
    active: true,
    featured: false,
    createdAt: "2026-05-15",
    images: [img("gorra-rosa-1", "Modelo con la gorra TKF rosa frente a un mural")],
    variants: variants("p-gorra-rosa", "TKF-GOR-ROS", [C.rosa], ["Única"], (): number => 0),
  },
];

export const seed: Catalog = { categories, products };
