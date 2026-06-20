/**
 * Mock catalog data for the landing experience. Shapes mirror the Mongoose
 * models / service DTOs so swapping to live data is a drop-in change. Imagery
 * uses deterministic placeholders and is replaced by Cloudinary assets later.
 */
import type { BrandDTO, ProductCardDTO, ProductDetailDTO } from "@/types";
import { slugify } from "@/lib/utils";

/** @deprecated use `ProductCardDTO` from `@/types`. Kept as a local alias. */
export type DisplayProduct = ProductCardDTO;

const img = (seed: string) =>
  `https://picsum.photos/seed/${seed}/640/760`;

export const featuredProducts: DisplayProduct[] = [
  {
    id: "p1",
    slug: "snail-mucin-repair-serum",
    name: "Snail Mucin 96% Repair Serum",
    brand: "COSRX",
    category: "Serums",
    categorySlug: "serums",
    price: 1299,
    mrp: 1799,
    rating: 4.9,
    reviewCount: 2841,
    image: img("lanbel-serum-1"),
    badges: ["best", "featured"],
    stock: 42,
  },
  {
    id: "p2",
    slug: "rice-glow-deep-cleanser",
    name: "Rice Glow Deep Cleansing Foam",
    brand: "Beauty of Joseon",
    category: "Cleansers",
    categorySlug: "cleansers",
    price: 899,
    mrp: 1199,
    rating: 4.8,
    reviewCount: 1577,
    image: img("lanbel-cleanser-1"),
    badges: ["trending"],
    stock: 60,
  },
  {
    id: "p3",
    slug: "relief-sun-rice-probiotics-spf50",
    name: "Relief Sun: Rice + Probiotics SPF50+",
    brand: "Beauty of Joseon",
    category: "Sunscreens",
    categorySlug: "sunscreens",
    price: 1099,
    mrp: 1399,
    rating: 4.9,
    reviewCount: 3920,
    image: img("lanbel-sun-1"),
    badges: ["best"],
    stock: 25,
  },
  {
    id: "p4",
    slug: "green-tea-balancing-toner",
    name: "Green Tea Balancing Toner",
    brand: "Innisfree",
    category: "Toners",
    categorySlug: "toners",
    price: 999,
    mrp: 1299,
    rating: 4.7,
    reviewCount: 1043,
    image: img("lanbel-toner-1"),
    badges: ["new"],
    stock: 38,
  },
  {
    id: "p5",
    slug: "ceramide-barrier-moisturizer",
    name: "Ceramide Barrier Cream",
    brand: "Dr.Jart+",
    category: "Moisturizers",
    categorySlug: "moisturizers",
    price: 1599,
    mrp: 2099,
    rating: 4.8,
    reviewCount: 876,
    image: img("lanbel-moist-1"),
    badges: ["featured"],
    stock: 19,
  },
  {
    id: "p6",
    slug: "honey-overnight-lip-mask",
    name: "Honey Overnight Lip Sleeping Mask",
    brand: "LANEIGE",
    category: "Lip Care",
    categorySlug: "lip-care",
    price: 1349,
    mrp: 1699,
    rating: 4.9,
    reviewCount: 5120,
    image: img("lanbel-lip-1"),
    badges: ["best", "trending"],
    stock: 7,
  },
  {
    id: "p7",
    slug: "centella-soothing-sheet-mask",
    name: "Centella Soothing Sheet Mask (10pk)",
    brand: "Mediheal",
    category: "Face Masks",
    categorySlug: "face-masks",
    price: 1199,
    mrp: 1599,
    rating: 4.6,
    reviewCount: 642,
    image: img("lanbel-mask-1"),
    badges: ["new"],
    stock: 54,
  },
  {
    id: "p8",
    slug: "perfect-hair-fill-up-treatment",
    name: "Perfect Hair Fill-Up Treatment",
    brand: "Mise en Scène",
    category: "Hair Care",
    categorySlug: "hair-care",
    price: 749,
    mrp: 999,
    rating: 4.7,
    reviewCount: 388,
    image: img("lanbel-hair-1"),
    badges: ["trending"],
    stock: 31,
  },
];

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  service: string;
  rating: number;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ananya Sharma",
    location: "Mumbai",
    service: "Snail Mucin Serum + Toner",
    rating: 5,
    quote:
      "Genuinely the real deal — sealed Korean packaging and my skin has never looked this clear. Shipping took two weeks but completely worth the wait.",
  },
  {
    id: "t2",
    name: "Priya Nair",
    location: "Bangalore",
    service: "Relief Sun SPF50+",
    rating: 5,
    quote:
      "No white cast, no stickiness — exactly the sunscreen I couldn’t find locally. Lanbel’s authenticity guarantee made me finally trust an online K-beauty store.",
  },
  {
    id: "t3",
    name: "Riya Kapoor",
    location: "Delhi",
    service: "Lip Sleeping Mask",
    rating: 5,
    quote:
      "Wrapped beautifully, original batch codes, and customer support kept me updated through customs. My whole routine is from Lanbel now.",
  },
  {
    id: "t4",
    name: "Sneha Reddy",
    location: "Hyderabad",
    service: "Ceramide Barrier Cream",
    rating: 5,
    quote:
      "My sensitive skin finally calmed down. Loved that they explain the ingredients and how to layer everything. Will reorder for sure.",
  },
];

export const instagramPosts = Array.from({ length: 6 }, (_, i) => ({
  id: `ig-${i + 1}`,
  image: `https://picsum.photos/seed/lanbel-ig-${i + 1}/500/500`,
  href: "https://instagram.com/lanbel",
}));

export const brandLogos = [
  "COSRX",
  "Beauty of Joseon",
  "LANEIGE",
  "Innisfree",
  "Dr.Jart+",
  "Mediheal",
  "SKIN1004",
  "Anua",
];

/** Brand filter options derived from the mock catalog. */
export const mockBrands: BrandDTO[] = brandLogos.map((name) => ({
  id: slugify(name),
  name,
  slug: slugify(name),
  country: "South Korea",
}));

/** Full mock catalog used by the shop when no database is configured. */
export const mockProducts = featuredProducts;

export function findMockProduct(slug: string): ProductDetailDTO | null {
  const card = mockProducts.find((p) => p.slug === slug);
  if (!card) return null;
  return {
    ...card,
    sku: card.id.toUpperCase(),
    brandSlug: slugify(card.brand),
    description: `${card.name} is an authentic Korean formulation by ${card.brand}, imported in original sealed packaging. Crafted for visibly healthier, glass-skin results, it layers effortlessly into any routine.`,
    shortDescription: `Authentic ${card.brand} ${card.category.toLowerCase()} for a healthy, radiant glow.`,
    images: [
      { url: card.image, alt: card.name },
      { url: card.image.replace(/\/\d+\/\d+$/, "/641/761"), alt: `${card.name} alternate` },
    ],
    ingredients: [
      "Aqua (Water)",
      "Niacinamide",
      "Sodium Hyaluronate",
      "Panthenol",
      "Centella Asiatica Extract",
    ],
    howToUse: [
      "Cleanse and tone your skin.",
      `Apply ${card.name} gently to the face and neck.`,
      "Follow with moisturizer and SPF in the morning.",
    ],
    benefits: ["Deep hydration", "Strengthens skin barrier", "Visible glow"],
    skinTypes: ["all", "sensitive", "dry"],
    volume: "100ml",
    countryOfOrigin: "South Korea",
    discountPercent:
      card.mrp > card.price
        ? Math.round(((card.mrp - card.price) / card.mrp) * 100)
        : 0,
    inStock: card.stock > 0,
  };
}
