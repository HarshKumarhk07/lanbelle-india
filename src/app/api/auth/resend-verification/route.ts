import { type NextRequest } from "next/server";
import { resendVerification } from "@/services/auth.service";
import { resendVerificationSchema } from "@/lib/validations/auth";
import { success, handleApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    enforceRateLimit({
      key: `resend:${getClientIp(req)}`,
      limit: 3,
      windowMs: 60_000,
    });
    const body = await req.json().catch(() => ({}));
    const { email } = resendVerificationSchema.parse(body);
    await resendVerification(email);
    return success(
      null,
      "If an unverified account exists for this email, a new link has been sent.",
    );
  } catch (error) {
    return handleApiError(error);
  }
}
