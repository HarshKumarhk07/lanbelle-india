import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const highlights = [
  { icon: ShieldCheck, text: "100% authentic, batch-verified products" },
  { icon: Truck, text: "Imported directly from South Korea" },
  { icon: Sparkles, text: "Curated K-beauty for your glass-skin glow" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-plum p-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 size-72 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-10 size-80 rounded-full bg-gold/20 blur-3xl"
        />
        <Logo className="relative [&_span:last-child]:text-cream" />

        <div className="relative">
          <h1 className="max-w-md font-serif text-4xl font-semibold leading-tight">
            Korean skincare, delivered to your door.
          </h1>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-cream/80">
                <span className="grid size-9 place-items-center rounded-full bg-cream/10">
                  <Icon className="size-4 text-gold" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-cream/60">
          Over 50,000 five-star reviews · 2M+ happy customers
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to store
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-soft sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
