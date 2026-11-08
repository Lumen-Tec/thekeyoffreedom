import { ChevronLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { NotFoundView } from "@/components/store/not-found-view";
import { ProductCard } from "@/components/store/product-card";
import { ProductDetail } from "@/components/store/product/product-detail";
import { ProductDetailSkeleton } from "@/components/store/product/product-detail-skeleton";
import { getCategories, getProductBySlug, getProductSlugs, getRelatedProducts } from "@/lib/catalog";
import type { Category, Product } from "@/lib/schemas";

type SlugParams = { slug: string };

export async function generateStaticParams(): Promise<SlugParams[]> {
  const slugs: string[] = await getProductSlugs();
  return slugs.map((slug: string): SlugParams => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/tienda/[slug]">): Promise<Metadata> {
  const { slug }: SlugParams = await params;
  const product: Product | null = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0].src, alt: product.images[0].alt }],
    },
  };
}

/**
 * La carcasa (contenedor) no depende del producto, así que se muestra al
 * instante al navegar; los datos de la URL se leen dentro del `<Suspense>`.
 */
export default function ProductPage({ params }: PageProps<"/tienda/[slug]">): ReactNode {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/tienda/[slug]">, "params">): Promise<ReactNode> {
  const { slug }: SlugParams = await params;
  const product: Product | null = await getProductBySlug(slug);
  // Se renderiza la vista en lugar de lanzar notFound(): dentro de este
  // <Suspense> la respuesta ya empezó a transmitirse (el estado sería 200
  // igual), y la excepción a mitad del prerender rompe las mediciones de
  // rendimiento de React en desarrollo.
  if (!product) return <NotFoundView />;

  const [categories, related]: [Category[], Product[]] = await Promise.all([
    getCategories(),
    getRelatedProducts(product),
  ]);
  const category: Category | undefined = categories.find((c: Category): boolean => c.id === product.categoryId);

  return (
    <>
      <nav aria-label="Ruta" className="mb-6">
        <Link
          href={category ? `/tienda?cat=${category.slug}` : "/tienda"}
          className="inline-flex items-center gap-1 py-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ChevronLeftIcon className="size-4" />
          {category ? category.name : "Tienda"}
        </Link>
      </nav>

      <ProductDetail product={product} categoryName={category?.name ?? "Tienda"} />

      {related.length > 0 && (
        <section aria-labelledby="relacionados" className="mt-20">
          <h2 id="relacionados" className="mb-6 font-heading text-3xl">
            También te puede gustar
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {related.map(
              (p: Product): ReactNode => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ),
            )}
          </ul>
        </section>
      )}
    </>
  );
}
