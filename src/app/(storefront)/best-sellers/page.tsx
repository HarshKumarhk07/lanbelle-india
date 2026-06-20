import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/marketing/content";
import { ProductCard } from "@/components/product/product-card";
import { getShopProducts } from "@/services/catalog.service";

export const metadata: Metadata = {
  title: "Best Sellers",
  description:
    "Shop Lanbel's best-selling authentic Korean skincare, loved by thousands.",
};

export default async function BestSellersPage() {
  const { items } = await getShopProducts({
    flag: "bestSeller",
    sort: "popular",
    limit: 24,
  });

  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <PageHeader
        eyebrow="Top booked"
        title="Best sellers"
        description="Hand-picked favourites our community keeps coming back for — all authentic, all imported from Korea."
      />

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Best sellers will appear here soon.
          </p>
          <Button asChild className="mt-4">
            <Link href="/shop">Browse all products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
