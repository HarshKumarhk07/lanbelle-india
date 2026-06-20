import type { CartLine } from "@/types";

export const FREE_SHIPPING_THRESHOLD = 1499;
export const FLAT_SHIPPING_FEE = 99;
/** GST is treated as included in displayed prices (0 added at checkout). */
export const TAX_RATE = 0;

export interface CartTotals {
  subtotal: number;
  mrpTotal: number;
  savings: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  itemCount: number;
  freeShippingEligible: boolean;
  amountToFreeShipping: number;
}

/** Computes order totals from cart lines and an applied coupon discount. */
export function computeTotals(
  items: CartLine[],
  couponDiscount = 0,
): CartTotals {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const mrpTotal = items.reduce((sum, i) => sum + i.mrp * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const discount = Math.min(couponDiscount, subtotal);
  const taxable = subtotal - discount;
  const freeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = itemCount === 0 || freeShippingEligible ? 0 : FLAT_SHIPPING_FEE;
  const tax = Math.round(taxable * TAX_RATE);
  const total = Math.max(0, taxable + shippingFee + tax);

  return {
    subtotal,
    mrpTotal,
    savings: mrpTotal - subtotal,
    discount,
    shippingFee,
    tax,
    total,
    itemCount,
    freeShippingEligible,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}

/** Demo client-side coupons. Replaced by server validation at checkout. */
const DEMO_COUPONS: Record<string, { type: "percent" | "flat"; value: number; min: number }> = {
  WELCOME10: { type: "percent", value: 10, min: 0 },
  GLOW15: { type: "percent", value: 15, min: 1499 },
  KBEAUTY200: { type: "flat", value: 200, min: 999 },
};

export function evaluateCoupon(
  code: string,
  subtotal: number,
): { valid: boolean; discount: number; message: string } {
  const coupon = DEMO_COUPONS[code.trim().toUpperCase()];
  if (!coupon) {
    return { valid: false, discount: 0, message: "Invalid coupon code" };
  }
  if (subtotal < coupon.min) {
    return {
      valid: false,
      discount: 0,
      message: `Add ₹${coupon.min - subtotal} more to use this coupon`,
    };
  }
  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  return { valid: true, discount, message: "Coupon applied" };
}
