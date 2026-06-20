import type { Metadata } from "next";
import { ShieldCheck, Plane, PackageCheck, HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/marketing/content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${siteConfig.name} — authentic Korean skincare imported directly from South Korea.`,
};

const values = [
  {
    icon: ShieldCheck,
    title: "Authenticity first",
    desc: "Every product is genuine and batch-verified — never grey-market or counterfeit.",
  },
  {
    icon: Plane,
    title: "Straight from Seoul",
    desc: "We source directly from official Korean distributors and import on demand.",
  },
  {
    icon: PackageCheck,
    title: "Original packaging",
    desc: "Sealed, untampered packaging exactly as it ships from Korea.",
  },
  {
    icon: HeartHandshake,
    title: "Customer obsessed",
    desc: "Real people, fast support, and honest guidance for your skin.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <PageHeader
        eyebrow="Our story"
        title="Authentic K-beauty, delivered with care"
        description={siteConfig.description}
      />

      <div id="authenticity" className="mx-auto mt-14 max-w-3xl space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          {siteConfig.name} began with a simple frustration: it was nearly
          impossible to know whether the Korean skincare you bought online was
          the real thing. Counterfeits, expired stock and grey-market imports
          were everywhere.
        </p>
        <p>
          So we built a store around a single promise —{" "}
          <strong className="text-foreground">100% authenticity</strong>. We
          import directly from South Korea, keep products in their original
          sealed packaging, and stand behind every order. Because international
          shipping is part of that promise, delivery typically takes 7–21
          business days — and it&apos;s always worth the wait.
        </p>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <div
            key={v.title}
            className="rounded-2xl border border-border bg-card p-6 text-center"
          >
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <v.icon className="size-6" />
            </span>
            <h2 className="mt-4 font-medium">{v.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/30 to-gold/10 p-8 text-center md:grid-cols-4">
        {[
          ["50K+", "5-star reviews"],
          ["2M+", "Happy customers"],
          ["500+", "Authentic products"],
          ["4.9", "Average rating"],
        ].map(([value, label]) => (
          <div key={label}>
            <p className="font-serif text-3xl font-semibold text-primary md:text-4xl">
              {value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
