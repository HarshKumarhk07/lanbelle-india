import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/content";
import { getAllCategories } from "@/services/catalog.service";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse Korean skincare by category — cleansers, serums, SPF and more.",
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <PageHeader
        eyebrow="Shop by category"
        title="Find your ritual"
        description="From double-cleansing to glass-skin serums — explore curated K-beauty essentials for every step."
      />

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${category.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div
              aria-hidden
              className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"
            />
            <div className="relative flex items-start justify-between">
              {category.image ? (
                <div className="relative size-12 overflow-hidden rounded-xl">
                  <Image src={category.image} alt={category.name} fill sizes="48px" className="object-cover" />
                </div>
              ) : (
                <span className="grid size-12 place-items-center rounded-xl bg-accent/60 font-serif text-lg font-semibold text-primary">
                  {category.name[0]}
                </span>
              )}
              <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <div className="relative mt-8">
              <h2 className="font-medium">{category.name}</h2>
              {category.productCount != null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {category.productCount} products
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
