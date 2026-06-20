import { type NextRequest } from "next/server";
import { updateProfile } from "@/services/account.service";
import { profileSchema } from "@/lib/validations/account";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireUser();
    const body = await req.json().catch(() => ({}));
    const input = profileSchema.parse(body);
    const user = await updateProfile(session.id, input);
    return success({ user }, "Profile updated");
  } catch (error) {
    return handleApiError(error);
  }
}
