import { getUserReviews } from "@/services/review.service";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await requireUser();
    const reviews = await getUserReviews(user.id);
    return success({ reviews }, "Reviews fetched");
  } catch (error) {
    return handleApiError(error);
  }
}
