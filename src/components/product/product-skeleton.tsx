import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

/** Individual skeleton loader card replicating ProductCard shape. */
export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft",
        className
      )}
    >
      {/* Product Image Placeholder */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <Skeleton className="absolute inset-0 rounded-none bg-muted/40" />
      </div>

      {/* Product Info Placeholder */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand */}
        <Skeleton className="h-3 w-16" />

        {/* Title */}
        <div className="mt-1 space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Rating */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="size-3 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-3 w-8" />
        </div>

        {/* Price and Cart Button */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3.5 w-10" />
          </div>
          <Skeleton className="size-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  limit?: number;
  className?: string;
}

/** Responsive grid of skeleton cards matching storefront lists. */
export function ProductGridSkeleton({ limit = 4, className }: ProductGridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6", className)}>
      {Array.from({ length: limit }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
