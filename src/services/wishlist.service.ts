import { connectDB } from "@/lib/db";
import { Wishlist } from "@/models/wishlist.model";
import { Product } from "@/models/product.model";
import { toProductCard } from "@/services/serializers";
import type { ProductCardDTO } from "@/types";

const POPULATE = [
  { path: "brand", select: "name slug" },
  { path: "category", select: "name slug" },
];

async function hydrate(productIds: string[]): Promise<ProductCardDTO[]> {
  if (productIds.length === 0) return [];
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  })
    .populate(POPULATE)
    .lean();

  // Preserve the wishlist ordering.
  const byId = new Map(products.map((p) => [String(p._id), p]));
  return productIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((p) => toProductCard(p as never));
}

export async function getWishlist(userId: string): Promise<ProductCardDTO[]> {
  await connectDB();
  const wishlist = await Wishlist.findOne({ user: userId }).lean();
  if (!wishlist) return [];
  return hydrate(wishlist.products.map((p) => String(p)));
}

export async function replaceWishlist(
  userId: string,
  productIds: string[],
): Promise<ProductCardDTO[]> {
  await connectDB();
  const unique = Array.from(new Set(productIds));
  await Wishlist.findOneAndUpdate(
    { user: userId },
    { user: userId, products: unique },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return hydrate(unique);
}

export async function mergeWishlist(
  userId: string,
  guestIds: string[],
): Promise<ProductCardDTO[]> {
  await connectDB();
  const existing = await Wishlist.findOne({ user: userId }).lean();
  const merged = Array.from(
    new Set([...(existing?.products ?? []).map((p) => String(p)), ...guestIds]),
  );
  return replaceWishlist(userId, merged);
}
