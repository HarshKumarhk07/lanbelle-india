import { type NextRequest } from "next/server";
import { deleteReview } from "@/services/review.service";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteReview(user.id, id);
    return success(null, "Review deleted");
  } catch (error) {
    return handleApiError(error);
  }
}
