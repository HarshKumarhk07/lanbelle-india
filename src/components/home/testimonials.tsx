import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { RatingStars } from "@/components/product/rating-stars";
import { Stagger, Reveal, StaggerItem } from "@/components/motion/reveal";
import { testimonials } from "@/lib/mock-data";

const stats = [
  { value: "50K+", label: "5-star reviews" },
  { value: "2M+", label: "Happy customers" },
  { value: "500+", label: "Authentic products" },
  { value: "4.9", label: "Average rating" },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-gold text-sm font-semibold text-primary-foreground">
      {initials}
    </span>
  );
}

export function Testimonials() {
  return (
    <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
      <SectionHeading
        align="center"
        eyebrow="Loved by our community"
        title={
          <>
            Real glow,{" "}
            <span className="text-gradient-brand italic">real reviews</span>
          </>
        }
        description="Over 50,000 five-star reviews from K-beauty lovers across India."
      />

      <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t) => (
          <StaggerItem
            key={t.id}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <Quote className="size-7 text-primary/30" />
            <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
              “{t.quote}”
            </p>
            <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              <Avatar name={t.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.location} · {t.service}
                </p>
              </div>
            </div>
            <RatingStars value={t.rating} className="mt-3" />
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-12 grid grid-cols-2 gap-4 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/30 to-gold/10 p-8 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-serif text-3xl font-semibold text-primary md:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
