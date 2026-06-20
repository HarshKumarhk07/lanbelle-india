import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/marketing/content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms governing your use of ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-16">
      <PageHeader eyebrow="Legal" title="Terms of service" />
      <Prose>
        <p>
          By using {siteConfig.name}, you agree to these terms. Please read them
          carefully.
        </p>
        <h2>Orders & pricing</h2>
        <ul>
          <li>All prices are in INR and inclusive of applicable taxes.</li>
          <li>We may cancel orders due to pricing errors or stock issues, with a full refund.</li>
        </ul>
        <h2>Authenticity</h2>
        <p>
          We guarantee all products are authentic and imported directly from
          South Korea in original sealed packaging.
        </p>
        <h2>International shipping</h2>
        <p>
          Orders ship internationally and delivery typically takes 7–21 business
          days. By placing an order you acknowledge this timeline.
        </p>
        <h2>Accounts</h2>
        <p>
          You are responsible for keeping your account credentials secure.
          Notify us immediately of any unauthorized use.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          Skincare results vary by individual. Always patch-test new products.
          {` ${siteConfig.name}`} is not liable for individual reactions; consult
          a dermatologist if you have concerns.
        </p>
        <h2>Contact</h2>
        <p>
          Questions? Reach us at{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
        </p>
      </Prose>
    </div>
  );
}
