import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ProductPage } from "@/components/tienda/product/ProductPage";
import { getProduct } from "@/lib/product.server";

export const dynamic = "force-dynamic";

export default async function ProductRoute({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) notFound();

  return (
    <>
      <main>
        <ProductPage product={product} />
      </main>
      <Footer />
    </>
  );
}
