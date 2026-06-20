import { type NextRequest } from "next/server";
import { updateOrderStatus } from "@/services/admin.service";
import { updateOrderStatusSchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const input = updateOrderStatusSchema.parse(body);
    await updateOrderStatus(id, input);
    return success(null, "Order updated");
  } catch (error) {
    return handleApiError(error);
  }
}
