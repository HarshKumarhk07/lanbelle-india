import { PageHeader } from "@/components/marketing/content";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";

/** Loading skeleton layout for Best Sellers route. */
export default function BestSellersLoading() {
  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <PageHeader
        eyebrow="Top booked"
        title="Best sellers"
        description="Hand-picked favourites our community keeps coming back for — all authentic, all imported from Korea."
      />

      <ProductGridSkeleton limit={8} className="mt-12" />
    </div>
  );
}
