import { type NextRequest } from "next/server";
import { listAdminCoupons, createCoupon } from "@/services/admin.service";
import { adminCouponSchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError, HttpStatus } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await listAdminCoupons();
    return success({ coupons }, "Coupons fetched");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const input = adminCouponSchema.parse(body);
    await createCoupon(input);
    return success(null, "Coupon created", { status: HttpStatus.CREATED });
  } catch (error) {
    return handleApiError(error);
  }
}
