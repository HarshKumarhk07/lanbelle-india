import { type NextRequest } from "next/server";
import { createOrder, listUserOrders } from "@/services/order.service";
import { checkoutSchema } from "@/lib/validations/checkout";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError, HttpStatus } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    enforceRateLimit({
      key: `order:${user.id}`,
      limit: 10,
      windowMs: 60_000,
    });
    const body = await req.json().catch(() => ({}));
    const input = checkoutSchema.parse(body);
    const result = await createOrder(
      { id: user.id, email: user.email, name: user.name },
      input,
    );
    return success(result, "Order created", { status: HttpStatus.CREATED });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = req.nextUrl;
    const result = await listUserOrders(
      user.id,
      Number(searchParams.get("page")) || 1,
      Number(searchParams.get("limit")) || 10,
    );
    return success(result, "Orders fetched");
  } catch (error) {
    return handleApiError(error);
  }
}
