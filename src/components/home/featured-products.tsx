import { Suspense } from "react";
import { SectionHeading } from "@/components/home/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { getShopProducts } from "@/services/catalog.service";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";

export function FeaturedProducts() {
  return (
    <section className="bg-gradient-to-b from-cream/50 to-transparent py-16 md:py-24">
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Lanbelle Collection"
          title={
            <>
              Our{" "}
              <span className="text-gradient-brand italic">products</span>
            </>
          }
          description="Premium all-natural Korean skincare formulations imported directly from South Korea."
          action={{ label: "See all products", href: "/shop" }}
        />

        <Suspense fallback={<ProductGridSkeleton limit={4} className="mt-10" />}>
          <FeaturedProductsList />
        </Suspense>
      </div>
    </section>
  );
}

async function FeaturedProductsList() {
  try {
    const { items } = await getShopProducts({ sort: "rating", limit: 8 });

    if (items.length === 0) {
      return (
        <div className="mt-10 text-center py-8">
          <p className="text-sm text-muted-foreground">No products found.</p>
        </div>
      );
    }

    return (
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {items.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="mt-10 text-center py-8">
        <p className="text-sm text-destructive font-medium">
          Failed to load products. Please try again.
        </p>
      </div>
    );
  }
}
