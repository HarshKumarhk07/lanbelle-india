import type {
  ProductBadge,
  ProductCardDTO,
  ProductDetailDTO,
  CategoryDTO,
  BrandDTO,
} from "@/types";

interface RefLean {
  _id: { toString(): string };
  name: string;
  slug: string;
  logo?: { url?: string };
  country?: string;
  description?: string;
  icon?: string;
  image?: { url?: string };
}

interface ProductLean {
  _id: { toString(): string };
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  brand: RefLean | { toString(): string };
  category: RefLean | { toString(): string };
  images: { url: string; alt: string; publicId?: string }[];
  price: number;
  mrp: number;
  stock: number;
  ratingAverage: number;
  ratingCount: number;
  ingredients: string[];
  howToUse: string[];
  benefits: string[];
  skinTypes: string[];
  volume?: string;
  countryOfOrigin: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
}

function isPopulated(ref: unknown): ref is RefLean {
  return typeof ref === "object" && ref !== null && "name" in ref;
}

function deriveBadges(p: ProductLean): ProductBadge[] {
  const badges: ProductBadge[] = [];
  if (p.isBestSeller) badges.push("best");
  if (p.isFeatured) badges.push("featured");
  if (p.isNewArrival) badges.push("new");
  if (p.isTrending) badges.push("trending");
  return badges;
}

function discount(mrp: number, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function toProductCard(p: ProductLean): ProductCardDTO {
  const brand = isPopulated(p.brand) ? p.brand.name : "";
  const category = isPopulated(p.category) ? p.category.name : "";
  const categorySlug = isPopulated(p.category) ? p.category.slug : "";
  return {
    id: p._id.toString(),
    slug: p.slug,
    name: p.name,
    brand,
    category,
    categorySlug,
    price: p.price,
    mrp: p.mrp,
    rating: p.ratingAverage,
    reviewCount: p.ratingCount,
    image: p.images[0]?.url ?? "",
    badges: deriveBadges(p),
    stock: p.stock,
  };
}

export function toProductDetail(p: ProductLean): ProductDetailDTO {
  return {
    ...toProductCard(p),
    sku: p.sku,
    brandSlug: isPopulated(p.brand) ? p.brand.slug : "",
    description: p.description,
    shortDescription: p.shortDescription,
    images: p.images.map((img) => ({
      url: img.url,
      alt: img.alt,
      publicId: img.publicId,
    })),
    ingredients: p.ingredients,
    howToUse: p.howToUse,
    benefits: p.benefits,
    skinTypes: p.skinTypes,
    volume: p.volume,
    countryOfOrigin: p.countryOfOrigin,
    discountPercent: discount(p.mrp, p.price),
    inStock: p.stock > 0,
  };
}

export function toCategory(
  c: RefLean & { productCount?: number },
): CategoryDTO {
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    image: c.image?.url,
    productCount: c.productCount,
  };
}

export function toBrand(b: RefLean): BrandDTO {
  return {
    id: b._id.toString(),
    name: b.name,
    slug: b.slug,
    logo: b.logo?.url,
    country: b.country ?? "South Korea",
  };
}
