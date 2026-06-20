import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ShopSidebar } from "@/components/shop/shop-sidebar";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ShopPagination } from "@/components/shop/shop-pagination";
import {
  getShopProducts,
  getAllCategories,
  getAllBrands,
} from "@/services/catalog.service";
import type { ProductListParams, ProductSort } from "@/services/product.service";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Shop authentic Korean skincare — cleansers, toners, serums, sunscreens and more, imported directly from South Korea.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseParams(sp: SearchParams): ProductListParams {
  const num = (v: string | undefined) =>
    v != null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined;

  const category = first(sp.category)?.split(",").filter(Boolean);
  const brand = first(sp.brand)?.split(",").filter(Boolean);

  return {
    search: first(sp.q),
    category: category?.length ? category : undefined,
    brand: brand?.length ? brand : undefined,
    minPrice: num(first(sp.minPrice)),
    maxPrice: num(first(sp.maxPrice)),
    minRating: num(first(sp.rating)),
    inStock: first(sp.inStock) === "true",
    sort: (first(sp.sort) as ProductSort) ?? "newest",
    page: num(first(sp.page)) ?? 1,
    limit: 12,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const params = parseParams(sp);

  try {
    const [{ items, pagination }, categories, brands] = await Promise.all([
      getShopProducts(params),
      getAllCategories(),
      getAllBrands(),
    ]);

    return (
      <div className="container-px mx-auto max-w-7xl py-12">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            The collection
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">
            Shop all skincare
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Authentic Korean beauty, imported directly from South Korea in
            original sealed packaging.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className="space-y-4">
            <ShopSidebar categories={categories} brands={brands} />
          </div>

          <div>
            <ShopToolbar total={pagination.total} />

            {items.length === 0 ? (
              <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-accent/60 text-primary">
                  <SearchX className="size-7" />
                </div>
                <div>
                  <p className="font-medium">No products found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your filters or search terms.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/shop">Reset filters</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
                  {items.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
                <ShopPagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container-px mx-auto max-w-7xl py-12">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            The collection
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">
            Shop all skincare
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Authentic Korean beauty, imported directly from South Korea in
            original sealed packaging.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className="space-y-4">
            <ShopSidebar categories={[]} brands={[]} />
          </div>

          <div className="text-center py-16">
            <p className="text-sm text-destructive font-medium">
              Failed to load products. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
