import { type NextRequest } from "next/server";
import { login } from "@/services/auth.service";
import { loginSchema } from "@/lib/validations/auth";
import { success, handleApiError } from "@/lib/api-response";
import { setAuthCookies } from "@/lib/auth/cookies";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    enforceRateLimit({
      key: `login:${getClientIp(req)}`,
      limit: 10,
      windowMs: 60_000,
    });
    const body = await req.json().catch(() => ({}));
    const input = loginSchema.parse(body);
    const { user, accessToken, refreshToken, rememberMe } = await login(input);
    await setAuthCookies(accessToken, refreshToken, rememberMe);
    return success({ user }, "Welcome back!");
  } catch (error) {
    return handleApiError(error);
  }
}
