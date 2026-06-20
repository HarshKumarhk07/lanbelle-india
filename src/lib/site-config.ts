import {
  Droplets,
  FlaskConical,
  Sparkles,
  Sun,
  Layers,
  Smile,
  Scissors,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

/** Single source of truth for brand identity, navigation and taxonomy. */
export const siteConfig = {
  name: "Lanbelle",
  tagline: "Korean skincare, delivered to your door",
  description:
    "Lanbelle brings 100% authentic Korean skincare and cosmetics imported directly from South Korea — original brand packaging, secure payments, and worldwide-quality glow at your doorstep.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.jpg",
  email: "care@lanbelle.com",
  phone: "+91 98765 43210",
  address: "Seoul · Mumbai · Delhi",
  social: {
    instagram: "https://instagram.com/lanbelle",
    facebook: "https://facebook.com/lanbelle",
    youtube: "https://youtube.com/@lanbelle",
    pinterest: "https://pinterest.com/lanbelle",
  },
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export interface CategoryDef {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

/** Default skincare taxonomy — mirrored by the Category collection seed. */
export const categories: CategoryDef[] = [
  {
    slug: "cleansers",
    name: "Cleansers",
    description: "Gentle gels, oils & foams for a fresh canvas.",
    icon: Droplets,
  },
  {
    slug: "serums",
    name: "Serums",
    description: "Targeted actives for glow, firmness & clarity.",
    icon: Sparkles,
  },
];

export const footerNav = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Best Sellers", href: "/best-sellers" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Trending", href: "/shop?filter=trending" },
    { label: "Offers", href: "/shop?filter=discounted" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Returns & Refunds", href: "/refunds" },
    { label: "Track Order", href: "/account/orders" },
    { label: "FAQs", href: "/faqs" },
  ],
  company: [
    { label: "About Lanbelle", href: "/about" },
    { label: "Authenticity Promise", href: "/about#authenticity" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

/** International shipping copy reused at checkout and in emails. */
export const shippingNotice = {
  short:
    "Imported directly from South Korea · Delivery in 7–21 business days.",
  consent:
    "I understand that this order is shipped internationally from South Korea and delivery may take 7–21 business days.",
  confirmation:
    "Thank you for your purchase. All products are imported directly from South Korea to guarantee 100% authenticity. International shipping usually takes between 7–21 business days depending on customs clearance and delivery location. We will notify you once your order has been dispatched.",
} as const;

export const DEFAULT_PINCODE = "124001";
