import { type NextRequest } from "next/server";
import { listAdminOrders } from "@/services/admin.service";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;
    const result = await listAdminOrders(
      searchParams.get("status") ?? undefined,
      Number(searchParams.get("page")) || 1,
      Number(searchParams.get("limit")) || 20,
    );
    return success(result, "Orders fetched");
  } catch (error) {
    return handleApiError(error);
  }
}
