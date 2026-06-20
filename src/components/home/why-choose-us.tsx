import {
  BadgeCheck,
  Plane,
  PackageCheck,
  ShieldCheck,
  Headset,
} from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const reasons = [
  {
    icon: BadgeCheck,
    title: "100% Authentic Products",
    description:
      "Every item is genuine, verified by batch code — never grey-market or counterfeit.",
  },
  {
    icon: Plane,
    title: "Imported Directly from Korea",
    description:
      "Sourced from official Korean distributors and flown in fresh, not warehoused for years.",
  },
  {
    icon: PackageCheck,
    title: "Original Brand Packaging",
    description:
      "Sealed, untampered packaging exactly as it ships from Seoul.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "PCI-compliant checkout with Razorpay — UPI, cards and net-banking.",
  },
  {
    icon: Headset,
    title: "Fast Customer Support",
    description:
      "Real humans, quick replies, and proactive updates through customs.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="container-px mx-auto max-w-7xl py-16 md:py-24">
      <SectionHeading
        align="center"
        eyebrow="Why Lanbel"
        title={
          <>
            The authentic K-beauty{" "}
            <span className="text-gradient-brand italic">promise</span>
          </>
        }
        description="We obsess over authenticity so you can shop Korean skincare with total confidence."
      />

      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason) => {
          const Icon = reason.icon;
          return (
            <StaggerItem
              key={reason.title}
              className="group flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </span>
              <div>
                <h3 className="font-medium">{reason.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
