import "server-only";
import { algoliasearch } from "algoliasearch";
import type { ProductRecord } from "@/lib/types";

const appId = process.env.NEXT_PUBLIC_APPLICATION_ID;
const searchApiKey = process.env.NEXT_PUBLIC_SEARCH_API_KEY;
const mainIndex = process.env.NEXT_PUBLIC_MAIN_INDEX ?? "products";

if (!appId) throw new Error("Variable de entorno faltante: NEXT_PUBLIC_APPLICATION_ID");
if (!searchApiKey) throw new Error("Variable de entorno faltante: NEXT_PUBLIC_SEARCH_API_KEY");

const productClient = algoliasearch(appId, searchApiKey);

export async function getProduct(objectID: string) {
  try {
    return await productClient.getObject<ProductRecord>({
      indexName: mainIndex,
      objectID,
    });
  } catch {
    return null;
  }
}
