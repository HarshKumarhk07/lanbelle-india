import { success, failure, handleApiError, HttpStatus } from "@/lib/api-response";
import { readAuthCookies, setAccessCookie } from "@/lib/auth/cookies";
import { refresh } from "@/services/auth.service";

export async function POST() {
  try {
    const { refreshToken } = await readAuthCookies();
    if (!refreshToken) {
      return failure("No active session", HttpStatus.UNAUTHORIZED);
    }
    const result = await refresh(refreshToken);
    await setAccessCookie(result.accessToken);
    return success({ user: result.user }, "Session refreshed");
  } catch (error) {
    return handleApiError(error);
  }
}
