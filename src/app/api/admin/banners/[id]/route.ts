import { type NextRequest } from "next/server";
import { updateBanner, deleteBanner } from "@/services/admin.service";
import { adminBannerSchema } from "@/lib/validations/admin";
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
    const input = adminBannerSchema.parse(body);
    await updateBanner(id, input);
    return success(null, "Banner updated");
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
    await deleteBanner(id);
    return success(null, "Banner deleted");
  } catch (error) {
    return handleApiError(error);
  }
}
