import { type NextRequest } from "next/server";
import { listAdminUsers } from "@/services/admin.service";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;
    const result = await listAdminUsers(
      searchParams.get("search") ?? undefined,
      Number(searchParams.get("page")) || 1,
      Number(searchParams.get("limit")) || 20,
    );
    return success(result, "Users fetched");
  } catch (error) {
    return handleApiError(error);
  }
}
