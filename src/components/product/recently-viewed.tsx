"use client";

import { ProductCard } from "@/components/product/product-card";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { items } = useRecentlyViewed();
  const filtered = items.filter((p) => p.id !== excludeId).slice(0, 4);

  if (filtered.length === 0) return null;

  return (
    <section className="mt-20">
      <h2 className="font-serif text-2xl font-semibold">Recently viewed</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
