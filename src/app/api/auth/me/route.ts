import { success, handleApiError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth/session";
import { readAuthCookies, setAccessCookie } from "@/lib/auth/cookies";
import { refresh } from "@/services/auth.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (user) return success({ user });

    // Access token missing/expired — attempt a transparent refresh.
    const { refreshToken } = await readAuthCookies();
    if (refreshToken) {
      try {
        const result = await refresh(refreshToken);
        await setAccessCookie(result.accessToken);
        return success({ user: result.user });
      } catch {
        /* fall through to unauthenticated */
      }
    }

    return success({ user: null });
  } catch (error) {
    return handleApiError(error);
  }
}
