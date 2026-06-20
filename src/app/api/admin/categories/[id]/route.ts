import { type NextRequest } from "next/server";
import {
  updateCategory,
  deleteCategory,
} from "@/services/catalog-admin.service";
import { adminCategorySchema } from "@/lib/validations/admin";
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
    const input = adminCategorySchema.parse(body);
    await updateCategory(id, input);
    return success(null, "Category updated");
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
    await deleteCategory(id);
    return success(null, "Category deleted");
  } catch (error) {
    return handleApiError(error);
  }
}
