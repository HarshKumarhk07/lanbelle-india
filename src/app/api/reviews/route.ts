import { type NextRequest } from "next/server";
import { createReview } from "@/services/review.service";
import { createReviewSchema } from "@/lib/validations/account";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError, HttpStatus } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const input = createReviewSchema.parse(body);
    const review = await createReview(
      { id: user.id, name: user.name },
      input,
    );
    return success({ review }, "Review submitted — thank you!", {
      status: HttpStatus.CREATED,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
