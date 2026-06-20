import { type NextRequest } from "next/server";
import { resetPassword } from "@/services/auth.service";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { success, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, password } = resetPasswordSchema.parse(body);
    await resetPassword(token, password);
    return success(null, "Your password has been updated. Please sign in.");
  } catch (error) {
    return handleApiError(error);
  }
}
