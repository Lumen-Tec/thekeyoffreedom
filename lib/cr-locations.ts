import data from "@/data/cr-locations.json";

/** División territorial de Costa Rica: provincia → cantón → distrito. */

export type Canton = { name: string; districts: string[] };
export type Province = { name: string; cantons: Canton[] };

export const PROVINCES: Province[] = data as Province[];

export function cantonsOf(province: string): Canton[] {
  return PROVINCES.find((p: Province): boolean => p.name === province)?.cantons ?? [];
}

export function districtsOf(province: string, canton: string): string[] {
  return cantonsOf(province).find((c: Canton): boolean => c.name === canton)?.districts ?? [];
}
