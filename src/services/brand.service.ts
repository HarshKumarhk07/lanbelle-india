import { connectDB } from "@/lib/db";
import { Brand } from "@/models/brand.model";
import { toBrand } from "@/services/serializers";
import type { BrandDTO } from "@/types";

export async function getBrands(options?: {
  featuredOnly?: boolean;
}): Promise<BrandDTO[]> {
  await connectDB();
  const filter: Record<string, unknown> = { isActive: true };
  if (options?.featuredOnly) filter.isFeatured = true;
  const brands = await Brand.find(filter).sort({ name: 1 }).lean();
  return brands.map((b) => toBrand(b));
}

export async function getBrandBySlug(slug: string): Promise<BrandDTO | null> {
  await connectDB();
  const brand = await Brand.findOne({ slug, isActive: true }).lean();
  return brand ? toBrand(brand) : null;
}
