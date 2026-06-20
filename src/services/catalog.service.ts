import {
  listProducts,
  getProductBySlug,
  getRelatedProducts,
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  getTrendingProducts,
  getProductSlugs,
  type ProductListParams,
  type ProductSort,
} from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { getBrands } from "@/services/brand.service";
import { buildPagination, resolvePaging } from "@/utils/pagination";
import {
  mockProducts,
  mockBrands,
  findMockProduct,
} from "@/lib/mock-data";
import { categories as categoryDefs } from "@/lib/site-config";
import { slugify } from "@/lib/utils";
import type {
  BrandDTO,
  CategoryDTO,
  Paginated,
  ProductCardDTO,
  ProductDetailDTO,
} from "@/types";

/**
 * Read-side catalog facade. Uses the live MongoDB-backed services when a
 * database is configured, and transparently falls back to mock data otherwise
 * (or if the DB is unreachable), so the storefront is always renderable.
 */
const hasDb = Boolean(process.env.MONGODB_URI);

async function withFallback<T>(
  live: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  if (!hasDb) return fallback();
  try {
    return await live();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[catalog] live query failed, using mock data:", error);
    }
    return fallback();
  }
}

// ----------------------------- mock implementations -----------------------------

const sorters: Record<ProductSort, (a: ProductCardDTO, b: ProductCardDTO) => number> = {
  newest: () => 0,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  popular: (a, b) => b.reviewCount - a.reviewCount,
};

function mockList(params: ProductListParams): Paginated<ProductCardDTO> {
  const { page, limit, skip } = resolvePaging(params.page, params.limit);
  let items = [...mockProducts];

  const categories = params.category
    ? Array.isArray(params.category)
      ? params.category
      : [params.category]
    : [];
  if (categories.length) {
    items = items.filter((p) => categories.includes(p.categorySlug));
  }

  const brands = params.brand
    ? Array.isArray(params.brand)
      ? params.brand
      : [params.brand]
    : [];
  if (brands.length) {
    items = items.filter((p) => brands.includes(slugify(p.brand)));
  }

  if (params.minPrice != null) items = items.filter((p) => p.price >= params.minPrice!);
  if (params.maxPrice != null) items = items.filter((p) => p.price <= params.maxPrice!);
  if (params.minRating != null)
    items = items.filter((p) => p.rating >= params.minRating!);
  if (params.inStock) items = items.filter((p) => p.stock > 0);

  if (params.flag === "discounted") items = items.filter((p) => p.mrp > p.price);
  else if (params.flag === "featured") items = items.filter((p) => p.badges.includes("featured"));
  else if (params.flag === "bestSeller") items = items.filter((p) => p.badges.includes("best"));
  else if (params.flag === "trending") items = items.filter((p) => p.badges.includes("trending"));
  else if (params.flag === "newArrival") items = items.filter((p) => p.badges.includes("new"));

  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }

  items.sort(sorters[params.sort ?? "rating"]);
  const total = items.length;
  const paged = items.slice(skip, skip + limit);

  return { items: paged, pagination: buildPagination(total, page, limit) };
}

function mockCategories(): CategoryDTO[] {
  return categoryDefs.map((c) => ({
    id: c.slug,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon.displayName ?? c.slug,
    productCount: mockProducts.filter((p) => p.categorySlug === c.slug).length,
  }));
}

// ----------------------------- public API -----------------------------

export function getShopProducts(
  params: ProductListParams,
): Promise<Paginated<ProductCardDTO>> {
  return withFallback(
    () => listProducts(params),
    () => mockList(params),
  );
}

export function getProductDetail(slug: string): Promise<ProductDetailDTO | null> {
  return withFallback(
    () => getProductBySlug(slug),
    () => findMockProduct(slug),
  );
}

export function getRelated(
  slug: string,
  categorySlug: string,
): Promise<ProductCardDTO[]> {
  return withFallback(
    async () => {
      const product = await getProductBySlug(slug);
      if (!product) return [];
      return getRelatedProducts(product.id, product.categorySlug, 4).catch(
        () => [],
      );
    },
    () =>
      mockProducts
        .filter((p) => p.categorySlug === categorySlug && p.slug !== slug)
        .slice(0, 4),
  );
}

export function getAllCategories(): Promise<CategoryDTO[]> {
  return withFallback(
    () => getCategories({ withCounts: true }),
    () => mockCategories(),
  );
}

export function getAllBrands(): Promise<BrandDTO[]> {
  return withFallback(() => getBrands(), () => mockBrands);
}

export function getHomeFeatured(limit = 8): Promise<ProductCardDTO[]> {
  return withFallback(
    () => getFeaturedProducts(limit),
    () => mockProducts.filter((p) => p.badges.includes("featured")).slice(0, limit),
  );
}

export function getHomeBestSellers(limit = 8): Promise<ProductCardDTO[]> {
  return withFallback(
    () => getBestSellers(limit),
    () => mockProducts.filter((p) => p.badges.includes("best")).slice(0, limit),
  );
}

export function getHomeNewArrivals(limit = 8): Promise<ProductCardDTO[]> {
  return withFallback(
    () => getNewArrivals(limit),
    () => mockProducts.filter((p) => p.badges.includes("new")).slice(0, limit),
  );
}

export function getHomeTrending(limit = 8): Promise<ProductCardDTO[]> {
  return withFallback(
    () => getTrendingProducts(limit),
    () => mockProducts.filter((p) => p.badges.includes("trending")).slice(0, limit),
  );
}

export function getAllProductSlugs(): Promise<string[]> {
  return withFallback(
    () => getProductSlugs(),
    () => mockProducts.map((p) => p.slug),
  );
}
