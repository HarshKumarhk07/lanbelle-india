import { type NextRequest } from "next/server";
import { z } from "zod";
import { getCart, replaceCart, clearCart } from "@/services/cart.service";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

const replaceSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .default([]),
  couponCode: z.string().trim().optional().or(z.literal("")),
});

export async function GET() {
  try {
    const user = await requireUser();
    const cart = await getCart(user.id);
    return success({ cart }, "Cart fetched");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const { items, couponCode } = replaceSchema.parse(body);
    const cart = await replaceCart(user.id, items, couponCode || undefined);
    return success({ cart }, "Cart updated");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await clearCart(user.id);
    return success({ cart: { items: [], couponDiscount: 0, couponValid: false } }, "Cart cleared");
  } catch (error) {
    return handleApiError(error);
  }
}
