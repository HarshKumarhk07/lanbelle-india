import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Prose } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Lanbel returns, refunds and cancellation policy.",
};

export default function RefundsPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <PageHeader
        eyebrow="Policies"
        title="Returns & refunds"
        description="Your satisfaction matters. Here's how returns, refunds and cancellations work."
      />
      <Prose>
        <h2>Cancellations</h2>
        <p>
          You can cancel an order for a full refund any time before it is
          dispatched. Once an order has shipped from Korea it can no longer be
          cancelled.
        </p>
        <h2>Damaged or incorrect items</h2>
        <p>
          If your order arrives damaged, defective, or incorrect, contact us
          within <strong>48 hours</strong> of delivery with photos. We&apos;ll
          arrange a replacement or full refund at no cost to you.
        </p>
        <h2>Hygiene & skincare returns</h2>
        <ul>
          <li>For safety, opened or used skincare cannot be returned unless faulty.</li>
          <li>Unopened items in original sealed packaging may be returned within 7 days of delivery.</li>
        </ul>
        <h2>Refund timeline</h2>
        <p>
          Approved refunds are processed to your original payment method within
          5–7 business days. Razorpay refunds may take additional time to
          reflect depending on your bank.
        </p>
        <h2>How to request</h2>
        <p>
          Email <a href="mailto:care@lanbel.com">care@lanbel.com</a> or use our{" "}
          <Link href="/contact">contact form</Link> with your order number.
        </p>
      </Prose>
    </div>
  );
}
