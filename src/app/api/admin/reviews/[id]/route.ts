import { type NextRequest } from "next/server";
import { setReviewStatus, deleteReviewAdmin } from "@/services/admin.service";
import { requireAdmin } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const schema = z.object({ status: z.enum(["approved", "rejected"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { status } = schema.parse(body);
    await setReviewStatus(id, status);
    return success(null, "Review updated");
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
    await deleteReviewAdmin(id);
    return success(null, "Review deleted");
  } catch (error) {
    return handleApiError(error);
  }
}
