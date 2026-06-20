import type { FilterQuery, Model, SortOrder } from "mongoose";
import { connectDB } from "@/lib/db";
import { Product, type IProduct } from "@/models/product.model";
import { Category } from "@/models/category.model";
import { Brand } from "@/models/brand.model";
import { toProductCard, toProductDetail } from "@/services/serializers";
import { buildPagination, resolvePaging } from "@/utils/pagination";
import type { Paginated, ProductCardDTO, ProductDetailDTO } from "@/types";

export type ProductSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "popular";

export interface ProductListParams {
  search?: string;
  category?: string | string[];
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  flag?: "featured" | "bestSeller" | "trending" | "newArrival" | "discounted";
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

const flagFieldMap: Record<string, string> = {
  featured: "isFeatured",
  bestSeller: "isBestSeller",
  trending: "isTrending",
  newArrival: "isNewArrival",
};

const sortMap: Record<ProductSort, Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { ratingAverage: -1, ratingCount: -1 },
  popular: { unitsSold: -1, ratingAverage: -1 },
};

const POPULATE = [
  { path: "brand", select: "name slug logo country" },
  { path: "category", select: "name slug icon" },
];

async function resolveSlugsToIds<T>(
  model: Model<T>,
  slugs: string[],
): Promise<string[]> {
  const docs = await model
    .find({ slug: { $in: slugs } } as FilterQuery<T>)
    .select("_id")
    .lean();
  return docs.map((d) => String(d._id));
}

function asArray(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Paginated, filtered, sorted product listing for the shop. */
export async function listProducts(
  params: ProductListParams = {},
): Promise<Paginated<ProductCardDTO>> {
  await connectDB();

  const { page, limit, skip } = resolvePaging(params.page, params.limit);
  const filter: FilterQuery<IProduct> = { isActive: true, isPublished: true };

  const categorySlugs = asArray(params.category);
  if (categorySlugs.length) {
    const ids = await resolveSlugsToIds(Category, categorySlugs);
    filter.category = { $in: ids.length ? ids : ["000000000000000000000000"] };
  }

  const brandSlugs = asArray(params.brand);
  if (brandSlugs.length) {
    const ids = await resolveSlugsToIds(Brand, brandSlugs);
    filter.brand = { $in: ids.length ? ids : ["000000000000000000000000"] };
  }

  if (params.minPrice != null || params.maxPrice != null) {
    const price: { $gte?: number; $lte?: number } = {};
    if (params.minPrice != null) price.$gte = params.minPrice;
    if (params.maxPrice != null) price.$lte = params.maxPrice;
    filter.price = price;
  }

  if (params.minRating != null) filter.ratingAverage = { $gte: params.minRating };
  if (params.inStock) filter.stock = { $gt: 0 };

  if (params.flag === "discounted") {
    filter.$expr = { $lt: ["$price", "$mrp"] };
  } else if (params.flag) {
    const flagField = flagFieldMap[params.flag];
    if (flagField) filter[flagField] = true;
  }

  const isSearch = Boolean(params.search?.trim());
  if (isSearch) filter.$text = { $search: params.search!.trim() };

  const sort: Record<string, SortOrder | { $meta: string }> = isSearch
    ? { score: { $meta: "textScore" }, ...sortMap[params.sort ?? "rating"] }
    : sortMap[params.sort ?? "newest"];

  const query = Product.find(filter);
  if (isSearch) query.select({ score: { $meta: "textScore" } });

  const [items, total] = await Promise.all([
    query
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(POPULATE)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items: items.map((p) => toProductCard(p as never)),
    pagination: buildPagination(total, page, limit),
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetailDTO | null> {
  await connectDB();
  const product = await Product.findOne({
    slug,
    isActive: true,
    isPublished: true,
  })
    .populate(POPULATE)
    .lean();
  return product ? toProductDetail(product as never) : null;
}

async function findByFlag(
  field: string,
  limit: number,
): Promise<ProductCardDTO[]> {
  await connectDB();
  const products = await Product.find({
    isActive: true,
    isPublished: true,
    [field]: true,
  })
    .sort({ ratingAverage: -1, createdAt: -1 })
    .limit(limit)
    .populate(POPULATE)
    .lean();
  return products.map((p) => toProductCard(p as never));
}

export const getFeaturedProducts = (limit = 8) =>
  findByFlag("isFeatured", limit);
export const getBestSellers = (limit = 8) => findByFlag("isBestSeller", limit);
export const getTrendingProducts = (limit = 8) =>
  findByFlag("isTrending", limit);
export const getNewArrivals = (limit = 8) => findByFlag("isNewArrival", limit);

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4,
): Promise<ProductCardDTO[]> {
  await connectDB();
  const products = await Product.find({
    _id: { $ne: productId },
    category: categoryId,
    isActive: true,
    isPublished: true,
  })
    .sort({ ratingAverage: -1 })
    .limit(limit)
    .populate(POPULATE)
    .lean();
  return products.map((p) => toProductCard(p as never));
}

export async function getProductSlugs(): Promise<string[]> {
  await connectDB();
  const products = await Product.find({ isActive: true, isPublished: true })
    .select("slug")
    .lean();
  return products.map((p) => p.slug);
}
