import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategorySection } from "@/components/home/category-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { ShippingTimeline } from "@/components/home/shipping-timeline";
import { Testimonials } from "@/components/home/testimonials";
import { NewsletterCta } from "@/components/home/newsletter-cta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CategorySection />
      <WhyChooseUs />
      <ShippingTimeline />
      <Testimonials />
      <NewsletterCta />
    </>
  );
}
