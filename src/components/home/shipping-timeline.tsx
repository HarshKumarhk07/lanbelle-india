import {
  MousePointerClick,
  CreditCard,
  Plane,
  Ship,
  PackageCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { shippingNotice } from "@/lib/site-config";

const steps = [
  {
    icon: MousePointerClick,
    title: "Choose Products",
    description: "Browse 500+ authentic K-beauty products and build your cart.",
  },
  {
    icon: CreditCard,
    title: "Checkout",
    description: "Enter your address and pay securely — UPI, card or net-banking.",
  },
  {
    icon: Plane,
    title: "Imported from Korea",
    description: "We source your order directly from official Korean suppliers.",
  },
  {
    icon: Ship,
    title: "International Shipping",
    description: "Your parcel clears customs and travels safely to your city.",
  },
  {
    icon: PackageCheck,
    title: "Delivered",
    description: "Sealed, authentic and ready — typically in 7–21 business days.",
  },
];

export function ShippingTimeline() {
  return (
    <section className="bg-gradient-to-b from-transparent via-accent/20 to-transparent py-16 md:py-24">
      <div className="container-px mx-auto max-w-7xl">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title={
            <>
              From Seoul{" "}
              <span className="text-gradient-brand italic">to your door</span>
            </>
          }
          description={shippingNotice.short}
        />

        <Stagger className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {/* Connecting line (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <StaggerItem
                key={step.title}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative grid size-14 place-items-center rounded-full border border-border bg-card text-primary shadow-soft">
                  <Icon className="size-6" />
                  <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-medium">{step.title}</h3>
                <p className="mt-1.5 max-w-[15rem] text-sm text-muted-foreground">
                  {step.description}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-card/60 p-5 text-center text-sm text-muted-foreground shadow-soft">
          {shippingNotice.confirmation}
        </Reveal>
      </div>
    </section>
  );
}
