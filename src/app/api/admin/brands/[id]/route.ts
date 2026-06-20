import { type NextRequest } from "next/server";
import { updateBrand, deleteBrand } from "@/services/catalog-admin.service";
import { adminBrandSchema } from "@/lib/validations/admin";
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
    const input = adminBrandSchema.parse(body);
    await updateBrand(id, input);
    return success(null, "Brand updated");
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
    await deleteBrand(id);
    return success(null, "Brand deleted");
  } catch (error) {
    return handleApiError(error);
  }
}
