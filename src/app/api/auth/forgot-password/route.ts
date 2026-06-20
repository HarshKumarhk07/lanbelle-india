import { type NextRequest } from "next/server";
import { forgotPassword } from "@/services/auth.service";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { success, handleApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    enforceRateLimit({
      key: `forgot:${getClientIp(req)}`,
      limit: 3,
      windowMs: 60_000,
    });
    const body = await req.json().catch(() => ({}));
    const { email } = forgotPasswordSchema.parse(body);
    await forgotPassword(email);
    return success(
      null,
      "If an account exists for this email, a reset link has been sent.",
    );
  } catch (error) {
    return handleApiError(error);
  }
}
