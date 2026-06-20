import { SectionHeading } from "@/components/home/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { getShopProducts } from "@/services/catalog.service";

export async function FeaturedProducts() {
  const { items } = await getShopProducts({ sort: "rating", limit: 8 });

  if (items.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-cream/50 to-transparent py-16 md:py-24">
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Most loved"
          title={
            <>
              Best-selling{" "}
              <span className="text-gradient-brand italic">K-beauty</span>
            </>
          }
          description="Hand-picked, authenticity-verified favourites our community keeps coming back for."
          action={{ label: "See all products", href: "/shop" }}
        />

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
