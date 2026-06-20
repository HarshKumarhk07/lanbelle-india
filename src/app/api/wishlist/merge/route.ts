import { type NextRequest } from "next/server";
import { z } from "zod";
import { mergeWishlist } from "@/services/wishlist.service";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

const schema = z.object({
  productIds: z.array(z.string().min(1)).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const { productIds } = schema.parse(body);
    const items = await mergeWishlist(user.id, productIds);
    return success({ items }, "Wishlist merged");
  } catch (error) {
    return handleApiError(error);
  }
}
