import { type NextRequest } from "next/server";
import { verifyEmail } from "@/services/auth.service";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { success, handleApiError } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token } = verifyEmailSchema.parse(body);
    const { user, accessToken, refreshToken, rememberMe } =
      await verifyEmail(token);
    await setAuthCookies(accessToken, refreshToken, rememberMe);
    return success({ user }, "Email verified — welcome to Lanbel!");
  } catch (error) {
    return handleApiError(error);
  }
}
