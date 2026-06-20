import { connectDB } from "@/lib/db";
import { Product } from "@/models/product.model";
import { Category } from "@/models/category.model";
import { Brand } from "@/models/brand.model";
import { ApiError, HttpStatus } from "@/lib/api-response";
import { deleteImage } from "@/lib/cloudinary";
import { buildPagination, resolvePaging } from "@/utils/pagination";
import type {
  AdminProductInput,
  AdminCategoryInput,
  AdminBrandInput,
} from "@/lib/validations/admin";
import type { Paginated } from "@/types";

export interface AdminProductRow {
  id: string;
  name: string;
  sku: string;
  image: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  isPublished: boolean;
  isActive: boolean;
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  isFeatured: boolean;
  isActive: boolean;
  productCount: number;
}

export interface AdminBrandRow {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  country: string;
  isFeatured: boolean;
  isActive: boolean;
}

// --------------------------- Products ---------------------------

export async function listAdminProducts(
  search?: string,
  page?: number,
  limit?: number,
): Promise<Paginated<AdminProductRow>> {
  await connectDB();
  const paging = resolvePaging(page, limit ?? 20);
  const filter: Record<string, unknown> = {};
  if (search?.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { sku: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .populate({ path: "brand", select: "name" })
      .populate({ path: "category", select: "name" })
      .lean(),
    Product.countDocuments(filter),
  ]);

  const items: AdminProductRow[] = products.map((p) => ({
    id: String(p._id),
    name: p.name,
    sku: p.sku,
    image: p.images[0]?.url ?? "",
    brand:
      typeof p.brand === "object" && p.brand && "name" in p.brand
        ? (p.brand as { name: string }).name
        : "—",
    category:
      typeof p.category === "object" && p.category && "name" in p.category
        ? (p.category as { name: string }).name
        : "—",
    price: p.price,
    mrp: p.mrp,
    stock: p.stock,
    isPublished: p.isPublished,
    isActive: p.isActive,
  }));

  return { items, pagination: buildPagination(total, paging.page, paging.limit) };
}

export async function getAdminProduct(id: string) {
  await connectDB();
  const p = await Product.findById(id).lean();
  if (!p) throw new ApiError("Product not found", HttpStatus.NOT_FOUND);
  return {
    id: String(p._id),
    name: p.name,
    sku: p.sku,
    description: p.description,
    shortDescription: p.shortDescription ?? "",
    brand: String(p.brand),
    category: String(p.category),
    images: p.images.map((i) => ({ url: i.url, alt: i.alt, publicId: i.publicId })),
    price: p.price,
    mrp: p.mrp,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    tags: p.tags,
    ingredients: p.ingredients,
    howToUse: p.howToUse,
    benefits: p.benefits,
    skinTypes: p.skinTypes,
    volume: p.volume ?? "",
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isTrending: p.isTrending,
    isNewArrival: p.isNewArrival,
    isPublished: p.isPublished,
    isActive: p.isActive,
  };
}

export async function createProduct(input: AdminProductInput): Promise<string> {
  await connectDB();
  const product = await Product.create(input);
  return String(product._id);
}

export async function updateProduct(
  id: string,
  input: AdminProductInput,
): Promise<void> {
  await connectDB();
  const updated = await Product.findByIdAndUpdate(id, input, {
    runValidators: true,
  });
  if (!updated) throw new ApiError("Product not found", HttpStatus.NOT_FOUND);
}

export async function deleteProduct(id: string): Promise<void> {
  await connectDB();
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError("Product not found", HttpStatus.NOT_FOUND);
  await Promise.all(
    product.images
      .filter((i) => i.publicId)
      .map((i) => deleteImage(i.publicId!).catch(() => {})),
  );
}

// --------------------------- Categories ---------------------------

export async function listAdminCategories(): Promise<AdminCategoryRow[]> {
  await connectDB();
  const [categories, counts] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).lean(),
    Product.aggregate<{ _id: unknown; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return categories.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image?.url,
    order: c.order,
    isFeatured: c.isFeatured,
    isActive: c.isActive,
    productCount: countMap.get(String(c._id)) ?? 0,
  }));
}

export async function createCategory(input: AdminCategoryInput): Promise<void> {
  await connectDB();
  await Category.create(input);
}

export async function updateCategory(
  id: string,
  input: AdminCategoryInput,
): Promise<void> {
  await connectDB();
  const updated = await Category.findByIdAndUpdate(id, input, {
    runValidators: true,
  });
  if (!updated) throw new ApiError("Category not found", HttpStatus.NOT_FOUND);
}

export async function deleteCategory(id: string): Promise<void> {
  await connectDB();
  const count = await Product.countDocuments({ category: id });
  if (count > 0) {
    throw new ApiError(
      `Cannot delete — ${count} product(s) use this category`,
      HttpStatus.CONFLICT,
    );
  }
  await Category.findByIdAndDelete(id);
}

// --------------------------- Brands ---------------------------

export async function listAdminBrands(): Promise<AdminBrandRow[]> {
  await connectDB();
  const brands = await Brand.find().sort({ name: 1 }).lean();
  return brands.map((b) => ({
    id: String(b._id),
    name: b.name,
    slug: b.slug,
    description: b.description,
    logo: b.logo?.url,
    country: b.country,
    isFeatured: b.isFeatured,
    isActive: b.isActive,
  }));
}

export async function createBrand(input: AdminBrandInput): Promise<void> {
  await connectDB();
  await Brand.create(input);
}

export async function updateBrand(
  id: string,
  input: AdminBrandInput,
): Promise<void> {
  await connectDB();
  const updated = await Brand.findByIdAndUpdate(id, input, {
    runValidators: true,
  });
  if (!updated) throw new ApiError("Brand not found", HttpStatus.NOT_FOUND);
}

export async function deleteBrand(id: string): Promise<void> {
  await connectDB();
  const count = await Product.countDocuments({ brand: id });
  if (count > 0) {
    throw new ApiError(
      `Cannot delete — ${count} product(s) use this brand`,
      HttpStatus.CONFLICT,
    );
  }
  await Brand.findByIdAndDelete(id);
}
