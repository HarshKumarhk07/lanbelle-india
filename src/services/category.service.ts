import { connectDB } from "@/lib/db";
import { Category } from "@/models/category.model";
import { Product } from "@/models/product.model";
import { toCategory } from "@/services/serializers";
import type { CategoryDTO } from "@/types";

/** Returns active categories, optionally only featured, ordered for display. */
export async function getCategories(options?: {
  featuredOnly?: boolean;
  withCounts?: boolean;
}): Promise<CategoryDTO[]> {
  await connectDB();

  const filter: Record<string, unknown> = { isActive: true };
  if (options?.featuredOnly) filter.isFeatured = true;

  const categories = await Category.find(filter)
    .sort({ order: 1, name: 1 })
    .lean();

  if (!options?.withCounts) {
    return categories.map((c) => toCategory(c));
  }

  const counts = await Product.aggregate<{ _id: unknown; count: number }>([
    { $match: { isActive: true, isPublished: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return categories.map((c) =>
    toCategory({ ...c, productCount: countMap.get(String(c._id)) ?? 0 }),
  );
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryDTO | null> {
  await connectDB();
  const category = await Category.findOne({ slug, isActive: true }).lean();
  return category ? toCategory(category) : null;
}

export async function getCategorySlugs(): Promise<string[]> {
  await connectDB();
  const categories = await Category.find({ isActive: true })
    .select("slug")
    .lean();
  return categories.map((c) => c.slug);
}
