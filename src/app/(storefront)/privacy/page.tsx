import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Prose } from "@/components/marketing/content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your data.`,
};

export default function PrivacyPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <PageHeader eyebrow="Legal" title="Privacy policy" />
      <Prose>
        <p>
          {siteConfig.name} respects your privacy. This policy explains what we
          collect and how we use it.
        </p>
        <h2>Information we collect</h2>
        <ul>
          <li>Account details: name, email, phone and password (hashed).</li>
          <li>Order details: shipping/billing address and purchase history.</li>
          <li>Approximate location (only to estimate shipping) and usage analytics.</li>
        </ul>
        <h2>How we use it</h2>
        <ul>
          <li>To process orders, payments and deliveries.</li>
          <li>To provide support and send transactional emails.</li>
          <li>To improve our products and store experience.</li>
        </ul>
        <h2>Payments</h2>
        <p>
          Payments are processed securely by Razorpay. We never store your full
          card details on our servers.
        </p>
        <h2>Data security</h2>
        <p>
          We use industry-standard security including encryption in transit,
          hashed passwords and httpOnly authentication cookies.
        </p>
        <h2>Your rights</h2>
        <p>
          You can access, update or delete your account data at any time from
          your <Link href="/account/settings">account settings</Link>, or contact us
          at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
        </p>
      </Prose>
    </div>
  );
}
