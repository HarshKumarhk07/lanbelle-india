import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/coupon.model";
import { evaluateCoupon } from "@/utils/pricing";

export interface CouponResult {
  valid: boolean;
  code: string;
  discount: number;
  message: string;
  isDbCoupon: boolean;
}

/**
 * Validates a coupon for a user and subtotal. Uses the Coupon collection when
 * available, falling back to built-in demo coupons otherwise.
 */
export async function validateCoupon(
  rawCode: string,
  userId: string,
  subtotal: number,
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, code, discount: 0, message: "No coupon", isDbCoupon: false };
  }

  await connectDB();
  const coupon = await Coupon.findOne({ code, isActive: true });

  if (!coupon) {
    const demo = evaluateCoupon(code, subtotal);
    return { ...demo, code, isDbCoupon: false };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, code, discount: 0, message: "Coupon not active yet", isDbCoupon: true };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, code, discount: 0, message: "Coupon has expired", isDbCoupon: true };
  }
  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      code,
      discount: 0,
      message: `Minimum order of ₹${coupon.minOrderAmount} required`,
      isDbCoupon: true,
    };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, code, discount: 0, message: "Coupon usage limit reached", isDbCoupon: true };
  }
  const userUsage = coupon.usedBy.find((u) => String(u.user) === userId);
  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    return { valid: false, code, discount: 0, message: "You've already used this coupon", isDbCoupon: true };
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === "fixed") {
    discount = coupon.value;
  }
  discount = Math.min(discount, subtotal);

  return { valid: true, code, discount, message: "Coupon applied", isDbCoupon: true };
}

/** Records coupon usage after a successful order (DB coupons only). */
export async function recordCouponUsage(
  code: string,
  userId: string,
): Promise<void> {
  await connectDB();
  const coupon = await Coupon.findOne({ code });
  if (!coupon) return;

  const usage = coupon.usedBy.find((u) => String(u.user) === userId);
  if (usage) usage.count += 1;
  else coupon.usedBy.push({ user: userId as never, count: 1 });
  coupon.usedCount += 1;
  await coupon.save();
}
