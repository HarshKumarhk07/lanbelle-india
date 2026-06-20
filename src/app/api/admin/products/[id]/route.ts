import { type NextRequest } from "next/server";
import {
  getAdminProduct,
  updateProduct,
  deleteProduct,
} from "@/services/catalog-admin.service";
import { adminProductSchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await getAdminProduct(id);
    return success({ product }, "Product fetched");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const input = adminProductSchema.parse(body);
    await updateProduct(id, input);
    return success(null, "Product updated");
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
    await deleteProduct(id);
    return success(null, "Product deleted");
  } catch (error) {
    return handleApiError(error);
  }
}
