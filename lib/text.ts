const DIACRITICS: RegExp = new RegExp("\\p{Diacritic}", "gu");

/** Minúsculas y sin tildes: `"Camión"` → `"camion"`. */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

/** `"Gris carbón"` → `"gris-carbon"` */
export function slugify(text: string): string {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
