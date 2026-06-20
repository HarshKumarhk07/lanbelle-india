import { connectDB } from "@/lib/db";
import { Cart } from "@/models/cart.model";
import { Product } from "@/models/product.model";
import { validateCoupon } from "@/services/coupon.service";
import type { CartDTO, CartLine } from "@/types";

interface IncomingItem {
  productId: string;
  quantity: number;
}

/**
 * Reconciles requested items against live product data (price, stock,
 * availability) and an optional coupon. This is authoritative — the client
 * cart is only a convenience mirror.
 */
async function reconcile(
  userId: string,
  requested: IncomingItem[],
  couponCode?: string,
): Promise<{ lines: CartLine[]; storeItems: { product: string; quantity: number; priceAtAdd: number }[]; dto: CartDTO }> {
  const ids = requested.map((i) => i.productId);
  const products = ids.length
    ? await Product.find({ _id: { $in: ids }, isActive: true, isPublished: true })
        .populate({ path: "brand", select: "name" })
        .lean()
    : [];
  const map = new Map(products.map((p) => [String(p._id), p]));

  const lines: CartLine[] = [];
  const storeItems: { product: string; quantity: number; priceAtAdd: number }[] = [];

  for (const item of requested) {
    const product = map.get(item.productId);
    if (!product || product.stock <= 0) continue;
    const quantity = Math.max(1, Math.min(item.quantity, product.stock));
    lines.push({
      productId: item.productId,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url ?? "",
      price: product.price,
      mrp: product.mrp,
      quantity,
      stock: product.stock,
    });
    storeItems.push({ product: item.productId, quantity, priceAtAdd: product.price });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  let couponDiscount = 0;
  let couponValid = false;
  let validCode: string | undefined;
  if (couponCode && subtotal > 0) {
    const result = await validateCoupon(couponCode, userId, subtotal);
    if (result.valid) {
      couponDiscount = result.discount;
      couponValid = true;
      validCode = result.code;
    }
  }

  return {
    lines,
    storeItems,
    dto: { items: lines, couponCode: validCode, couponDiscount, couponValid },
  };
}

export async function getCart(userId: string): Promise<CartDTO> {
  await connectDB();
  const cart = await Cart.findOne({ user: userId }).lean();
  if (!cart) return { items: [], couponDiscount: 0, couponValid: false };

  const { dto, storeItems } = await reconcile(
    userId,
    cart.items.map((i) => ({ productId: String(i.product), quantity: i.quantity })),
    cart.couponCode,
  );

  // Persist any reconciliation (e.g. stock-clamped / dropped items).
  await Cart.updateOne(
    { user: userId },
    { items: storeItems, couponCode: dto.couponCode },
  );
  return dto;
}

/** Replaces the entire cart (used by the client on every mutation). */
export async function replaceCart(
  userId: string,
  items: IncomingItem[],
  couponCode?: string,
): Promise<CartDTO> {
  await connectDB();
  const { dto, storeItems } = await reconcile(userId, items, couponCode);
  await Cart.findOneAndUpdate(
    { user: userId },
    { user: userId, items: storeItems, couponCode: dto.couponCode },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return dto;
}

/** Merges guest items into the server cart (summing quantities). */
export async function mergeCart(
  userId: string,
  guestItems: IncomingItem[],
): Promise<CartDTO> {
  await connectDB();
  const existing = await Cart.findOne({ user: userId }).lean();

  const merged = new Map<string, number>();
  for (const i of existing?.items ?? []) {
    merged.set(String(i.product), i.quantity);
  }
  for (const i of guestItems) {
    merged.set(i.productId, (merged.get(i.productId) ?? 0) + i.quantity);
  }

  const items = Array.from(merged.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
  return replaceCart(userId, items, existing?.couponCode);
}

export async function clearCart(userId: string): Promise<void> {
  await connectDB();
  await Cart.findOneAndUpdate(
    { user: userId },
    { items: [], couponCode: undefined },
    { upsert: true },
  );
}
