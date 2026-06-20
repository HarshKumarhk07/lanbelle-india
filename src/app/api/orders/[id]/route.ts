import { type NextRequest } from "next/server";
import { getUserOrder } from "@/services/order.service";
import { requireUser } from "@/lib/auth/session";
import { success, failure, handleApiError, HttpStatus } from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const order = await getUserOrder(user.id, id);
    if (!order) return failure("Order not found", HttpStatus.NOT_FOUND);
    return success({ order }, "Order fetched");
  } catch (error) {
    return handleApiError(error);
  }
}
