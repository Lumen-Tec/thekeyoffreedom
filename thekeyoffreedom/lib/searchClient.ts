import { liteClient as algoliasearch } from "algoliasearch/lite";

const app_id = process.env.NEXT_PUBLIC_APPLICATION_ID;
const search_api_key = process.env.NEXT_PUBLIC_SEARCH_API_KEY;

export const algolia_indices = {
  main: process.env.NEXT_PUBLIC_MAIN_INDEX ?? "products",
  priceDesc: process.env.NEXT_PUBLIC_PRICE_DESC_INDEX ?? "products_price_desc",
  priceAsc: process.env.NEXT_PUBLIC_PRICE_ASC_INDEX ?? "products_price_asc",
} as const;

if (!app_id) throw new Error("Variable de entorno faltante: NEXT_PUBLIC_APPLICATION_ID");
if (!search_api_key) throw new Error("Variable de entorno faltante: NEXT_PUBLIC_SEARCH_API_KEY");

export const searchClient = algoliasearch(app_id, search_api_key);
