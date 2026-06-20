import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";

/** Loading skeleton layout for Shop/Collection route. */
export default function ShopLoading() {
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
        {/* Sidebar Skeleton */}
        <div className="space-y-7 hidden lg:block">
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div>
          {/* Toolbar Skeleton */}
          <div className="flex h-11 items-center justify-between border-b pb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>

          <ProductGridSkeleton limit={8} className="mt-6" />
        </div>
      </div>
    </div>
  );
}
