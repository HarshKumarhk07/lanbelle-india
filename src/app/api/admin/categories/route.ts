import { type NextRequest } from "next/server";
import {
  listAdminCategories,
  createCategory,
} from "@/services/catalog-admin.service";
import { adminCategorySchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError, HttpStatus } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await listAdminCategories();
    return success({ categories }, "Categories fetched");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const input = adminCategorySchema.parse(body);
    await createCategory(input);
    return success(null, "Category created", { status: HttpStatus.CREATED });
  } catch (error) {
    return handleApiError(error);
  }
}
