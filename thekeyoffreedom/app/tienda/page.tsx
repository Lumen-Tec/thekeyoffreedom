import { Footer } from "@/components/Footer";
import { Catalog } from "@/components/tienda/catalog/Catalog";

export default async function StorePage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  return (
    <>
      <main>
        <Catalog key={query} initialQuery={query} />
      </main>
      <Footer />
    </>
  );
}
