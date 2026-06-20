import type { Metadata } from "next";
import Link from "next/link";
import {
  MousePointerClick,
  CreditCard,
  Plane,
  PackageCheck,
} from "lucide-react";
import { PageHeader, Prose } from "@/components/marketing/content";
import { shippingNotice } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description:
    "How Lanbel ships authentic Korean skincare internationally from South Korea.",
};

const steps = [
  { icon: MousePointerClick, label: "You order", desc: "Place your order and pay securely." },
  { icon: Plane, label: "Imported from Korea", desc: "We source directly from Korea." },
  { icon: CreditCard, label: "Customs clearance", desc: "Your parcel clears international customs." },
  { icon: PackageCheck, label: "Delivered", desc: "Arrives in 7–21 business days." },
];

export default function ShippingPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <PageHeader
        eyebrow="Shipping & delivery"
        title="From Seoul to your doorstep"
        description={shippingNotice.short}
      />

      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="relative mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <s.icon className="size-6" />
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {i + 1}
              </span>
            </div>
            <h2 className="mt-3 font-medium">{s.label}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      <Prose>
        <h2>Why international shipping?</h2>
        <p>{shippingNotice.confirmation}</p>
        <h2>Delivery timeline</h2>
        <ul>
          <li><strong>Processing:</strong> 1–3 business days to source and dispatch from Korea.</li>
          <li><strong>Transit & customs:</strong> 6–18 business days depending on your location.</li>
          <li><strong>Total:</strong> typically 7–21 business days.</li>
        </ul>
        <h2>Shipping charges</h2>
        <ul>
          <li>Free shipping on orders over ₹1,499.</li>
          <li>A flat ₹99 applies to orders below the free-shipping threshold.</li>
        </ul>
        <h2>Tracking</h2>
        <p>
          Once your order is dispatched, we&apos;ll email a tracking number and
          you can follow it from your{" "}
          <Link href="/account/orders">account orders</Link>.
        </p>
      </Prose>
    </div>
  );
}
