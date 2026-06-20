import { type NextRequest } from "next/server";
import { updateCoupon, deleteCoupon } from "@/services/admin.service";
import { adminCouponSchema } from "@/lib/validations/admin";
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
    const input = adminCouponSchema.parse(body);
    await updateCoupon(id, input);
    return success(null, "Coupon updated");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteCoupon(id);
    return success(null, "Coupon deleted");
  } catch (error) {
    return handleApiError(error);
  }
}
