import { type NextRequest } from "next/server";
import { z } from "zod";
import { mergeCart } from "@/services/cart.service";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .default([]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const { items } = schema.parse(body);
    const cart = await mergeCart(user.id, items);
    return success({ cart }, "Cart merged");
  } catch (error) {
    return handleApiError(error);
  }
}
