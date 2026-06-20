import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "crypto";
import { getServerEnv } from "@/lib/env";
import { ApiError, HttpStatus } from "@/lib/api-response";

let instance: Razorpay | null = null;

/** Lazily-instantiated Razorpay client. Throws if keys are not configured. */
export function getRazorpay(): Razorpay {
  if (instance) return instance;
  const env = getServerEnv();
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(
      "Payments are not configured. Please contact support.",
      HttpStatus.INTERNAL,
    );
  }
  instance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
  return instance;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
}

/** Creates a Razorpay order. `amountInRupees` is converted to paise. */
export async function createRazorpayOrder(
  amountInRupees: number,
  receipt: string,
): Promise<RazorpayOrderResult> {
  const order = await getRazorpay().orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
    payment_capture: true,
  });
  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
  };
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Verifies the Razorpay payment signature returned to the client. */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const env = getServerEnv();
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  return safeCompare(expected, params.signature);
}

/** Verifies the raw webhook body against the `x-razorpay-signature` header. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const env = getServerEnv();
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return safeCompare(expected, signature);
}

export function getPublicRazorpayKey(): string {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
    process.env.RAZORPAY_KEY_ID ??
    ""
  );
}
