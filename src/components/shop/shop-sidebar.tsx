"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { BrandDTO, CategoryDTO } from "@/types";

interface ShopSidebarProps {
  categories: CategoryDTO[];
  brands: BrandDTO[];
}

const RATINGS = [4, 3, 2];

export function ShopSidebar({ categories, brands }: ShopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const selectedCategories = (searchParams.get("category") ?? "")
    .split(",")
    .filter(Boolean);
  const selectedBrands = (searchParams.get("brand") ?? "")
    .split(",")
    .filter(Boolean);
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const rating = searchParams.get("rating") ?? "";
  const inStock = searchParams.get("inStock") === "true";

  const update = React.useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const toggleMulti = (key: string, value: string, current: string[]) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update((p) => {
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });
  };

  const [priceMin, setPriceMin] = React.useState(minPrice);
  const [priceMax, setPriceMax] = React.useState(maxPrice);
  React.useEffect(() => setPriceMin(minPrice), [minPrice]);
  React.useEffect(() => setPriceMax(maxPrice), [maxPrice]);

  const applyPrice = () =>
    update((p) => {
      priceMin ? p.set("minPrice", priceMin) : p.delete("minPrice");
      priceMax ? p.set("maxPrice", priceMax) : p.delete("maxPrice");
    });

  const clearAll = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasFilters =
    selectedCategories.length ||
    selectedBrands.length ||
    minPrice ||
    maxPrice ||
    rating ||
    inStock;

  const panel = (
    <div className="space-y-7">
      <FilterGroup title="Category">
        <div className="space-y-2.5">
          {categories.map((c) => (
            <Checkbox
              key={c.id || c.slug || c.name}
              label={c.name}
              count={c.productCount}
              checked={selectedCategories.includes(c.slug)}
              onChange={() =>
                toggleMulti("category", c.slug, selectedCategories)
              }
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="space-y-2.5">
          {brands.map((b) => (
            <Checkbox
              key={b.id || b.slug || b.name}
              label={b.name}
              checked={selectedBrands.includes(b.slug)}
              onChange={() => toggleMulti("brand", b.slug, selectedBrands)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={applyPrice}
        >
          Apply price
        </Button>
      </FilterGroup>

      <FilterGroup title="Rating">
        <div className="space-y-2.5">
          {RATINGS.map((r) => (
            <button
              key={r}
              onClick={() =>
                update((p) =>
                  rating === String(r) ? p.delete("rating") : p.set("rating", String(r)),
                )
              }
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition",
                rating === String(r)
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60",
              )}
            >
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-3.5",
                      i < r ? "fill-gold text-gold" : "text-muted-foreground/40",
                    )}
                  />
                ))}
              </span>
              &amp; up
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <Checkbox
          label="In stock only"
          checked={inStock}
          onChange={() =>
            update((p) =>
              inStock ? p.delete("inStock") : p.set("inStock", "true"),
            )
          }
        />
      </FilterGroup>

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
          <X className="size-4" /> Clear all filters
        </Button>
      ) : null}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <Button
        variant="outline"
        className="w-full lg:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="size-4" /> Filters
      </Button>

      {/* Desktop panel */}
      <aside className="hidden lg:block">{panel}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-card p-5 shadow-lift">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <X className="size-5" />
              </button>
            </div>
            {panel}
            <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
              Show results
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <Label className="flex cursor-pointer items-center justify-between font-normal text-muted-foreground hover:text-foreground">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="size-4 rounded border-border accent-primary"
        />
        {label}
      </span>
      {count != null && (
        <span className="text-xs text-muted-foreground/70">{count}</span>
      )}
    </Label>
  );
}
