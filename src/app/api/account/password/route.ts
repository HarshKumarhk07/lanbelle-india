import { type NextRequest } from "next/server";
import { changePassword } from "@/services/account.service";
import { changePasswordSchema } from "@/lib/validations/account";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const body = await req.json().catch(() => ({}));
    const input = changePasswordSchema.parse(body);
    await changePassword(session.id, input.currentPassword, input.newPassword);
    return success(null, "Password updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
