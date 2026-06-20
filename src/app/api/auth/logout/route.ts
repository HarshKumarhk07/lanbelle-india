import { success, handleApiError } from "@/lib/api-response";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  try {
    await clearAuthCookies();
    return success(null, "You have been signed out.");
  } catch (error) {
    return handleApiError(error);
  }
}
