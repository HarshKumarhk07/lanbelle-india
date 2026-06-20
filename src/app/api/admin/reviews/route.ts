import { type NextRequest } from "next/server";
import { listAdminReviews } from "@/services/admin.service";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;
    const result = await listAdminReviews(
      searchParams.get("status") ?? undefined,
      Number(searchParams.get("page")) || 1,
      Number(searchParams.get("limit")) || 20,
    );
    return success(result, "Reviews fetched");
  } catch (error) {
    return handleApiError(error);
  }
}
