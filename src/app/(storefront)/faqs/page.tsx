import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about Lanbel Korean skincare.",
};

const faqs = [
  {
    q: "Are your products 100% authentic?",
    a: "Yes. Every product is genuine and imported directly from official Korean distributors in original sealed packaging — never grey-market or counterfeit.",
  },
  {
    q: "How long does delivery take?",
    a: "Because orders ship internationally from South Korea, delivery typically takes 7–21 business days depending on customs clearance and your location.",
  },
  {
    q: "How much is shipping?",
    a: "Shipping is free on orders over ₹1,499. A flat ₹99 applies to smaller orders.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept UPI, credit/debit cards and net banking via Razorpay, plus cash on delivery where available.",
  },
  {
    q: "Can I track my order?",
    a: "Yes. Once dispatched, you'll receive a tracking number by email and can follow your order from your account.",
  },
  {
    q: "What is your return policy?",
    a: "Unopened items in sealed packaging can be returned within 7 days. Damaged or incorrect items are replaced or refunded in full. See our Returns & Refunds page for details.",
  },
  {
    q: "How do I choose the right products for my skin?",
    a: "Each product lists suitable skin types, ingredients and how to use it. Reach out via our contact page for personalised guidance.",
  },
];

export default function FaqsPage() {
  return (
    <div className="container-px mx-auto max-w-3xl py-16">
      <PageHeader eyebrow="Help centre" title="Frequently asked questions" />

      <div className="mt-12 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-2xl border border-border bg-card p-5 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
              {faq.q}
              <Plus className="size-5 shrink-0 text-primary transition-transform group-open:rotate-45" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
