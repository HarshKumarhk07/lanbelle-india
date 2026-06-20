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
    slug: "natural-deep-cleansing-oil",
    name: "Natural Deep Cleansing Oil",
    brand: "Lanbelle",
    category: "Cleansers",
    categorySlug: "cleansers",
    price: 1999,
    mrp: 2499,
    rating: 4.9,
    reviewCount: 128,
    image: "/natural deep cleansing oil.webp",
    badges: ["best", "featured"],
    stock: 50,
  },
  {
    id: "p2",
    slug: "lanbelle-vita-energy-blemish-clear-ampoule",
    name: "Vita Energy Blemish Clear Ampoule",
    brand: "Lanbelle",
    category: "Serums",
    categorySlug: "serums",
    price: 2499,
    mrp: 2999,
    rating: 4.8,
    reviewCount: 96,
    image: "/Lanbelle vita energy blemish clear ampoule.webp",
    badges: ["trending"],
    stock: 35,
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
    service: "Natural Deep Cleansing Oil",
    rating: 5,
    quote:
      "Genuinely the real deal — my skin has never looked this clear after double cleansing. Lanbelle's cleansing oil is amazing.",
  },
  {
    id: "t2",
    name: "Priya Nair",
    location: "Bangalore",
    service: "Vita Energy Blemish Clear Ampoule",
    rating: 5,
    quote:
      "The blemish clear ampoule faded my dark spots in just two weeks! Truly premium Korean quality, imported directly.",
  },
];

export const instagramPosts = Array.from({ length: 6 }, (_, i) => ({
  id: `ig-${i + 1}`,
  image: `https://picsum.photos/seed/lanbel-ig-${i + 1}/500/500`,
  href: "https://instagram.com/lanbelle",
}));

export const brandLogos = [
  "Lanbelle",
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

  const isCleansingOil = slug === "natural-deep-cleansing-oil";

  return {
    ...card,
    sku: card.id.toUpperCase(),
    brandSlug: slugify(card.brand),
    description: isCleansingOil 
      ? "A premium all-natural deep cleansing oil that effectively removes makeup, sebum, and impurities while maintaining skin moisture. Formulated with natural botanical oils like grape seed oil and macadamia seed oil for a nourished and fresh finish."
      : "A concentrated brightening ampoule formulated to target blemishes, dark spots, and uneven skin tone. Drenched in vitamins to vitalize skin barrier and reveal a radiant, translucent glass-skin complexion.",
    shortDescription: isCleansingOil
      ? "100% natural oils for a gentle but deep cleanse."
      : "Vitamin-rich ampoule to clear blemishes and brighten skin.",
    images: isCleansingOil
      ? [
          { url: "/natural deep cleansing oil.webp", alt: "Lanbelle Natural Deep Cleansing Oil" },
          { url: "/LANBELLE Natural Deep Cleansing Oil 200ml Korea Beauty Made in Korea.jpg", alt: "Lanbelle Natural Deep Cleansing Oil 200ml" },
        ]
      : [
          { url: "/Lanbelle vita energy blemish clear ampoule.webp", alt: "Lanbelle Vita Energy Blemish Clear Ampoule" },
        ],
    ingredients: isCleansingOil
      ? ["Grape Seed Oil", "Macadamia Seed Oil", "Lemon Peel Oil", "Lavender Oil", "Eucalyptus Leaf Oil"]
      : ["Sea Buckthorn Extract", "Niacinamide", "Panthenol", "Ascorbic Acid", "Adenosine"],
    howToUse: isCleansingOil
      ? [
          "Pump an appropriate amount onto dry hands.",
          "Gently massage onto dry face to melt away makeup and impurities.",
          "Add water to emulsify and massage.",
          "Rinse thoroughly with lukewarm water."
        ]
      : [
          "After cleansing and toning, apply 2–3 drops to the face.",
          "Gently pat into the skin until fully absorbed.",
          "Follow with your favorite moisturizer."
        ],
    benefits: isCleansingOil
      ? ["Gentle deep cleansing", "Pore care & sebum control", "Keeps skin moisturized"]
      : ["Fades blemishes & dark spots", "Brightens skin tone", "Improves skin elasticity"],
    skinTypes: ["all", "sensitive", "dry"],
    volume: isCleansingOil ? "200ml" : "50ml",
    countryOfOrigin: "South Korea",
    discountPercent:
      card.mrp > card.price
        ? Math.round(((card.mrp - card.price) / card.mrp) * 100)
        : 0,
    inStock: card.stock > 0,
  };
}
