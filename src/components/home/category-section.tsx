import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { categories } from "@/lib/site-config";

export function CategorySection() {
  return (
    <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
      <SectionHeading
        eyebrow="Shop by category"
        title={
          <>
            Find your <span className="text-gradient-brand italic">ritual</span>
          </>
        }
        description="From double-cleansing to glass-skin serums — explore curated K-beauty essentials for every step of your routine."
        action={{ label: "View all categories", href: "/categories" }}
      />

      <Stagger className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <StaggerItem key={category.slug}>
              <Link
                href={`/shop?category=${category.slug}`}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div
                  aria-hidden
                  className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"
                />
                <div className="relative flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-accent/60 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div className="relative mt-8">
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
