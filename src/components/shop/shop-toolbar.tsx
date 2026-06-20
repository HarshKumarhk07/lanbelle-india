"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ShopToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "newest";
  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  React.useEffect(() => setQuery(searchParams.get("q") ?? ""), [searchParams]);

  const push = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    push((p) => (query.trim() ? p.set("q", query.trim()) : p.delete("q")));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{total}</span>{" "}
        {total === 1 ? "product" : "products"}
      </p>

      <div className="flex flex-1 items-center gap-2 sm:max-w-md">
        <form onSubmit={onSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="h-10 pl-10"
            aria-label="Search products"
          />
        </form>

        <label className="sr-only" htmlFor="sort">
          Sort by
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(e) => push((p) => p.set("sort", e.target.value))}
          className="h-10 shrink-0 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/30"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
