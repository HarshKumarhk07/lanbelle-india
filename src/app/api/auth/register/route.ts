import { type NextRequest } from "next/server";
import { register } from "@/services/auth.service";
import { registerSchema } from "@/lib/validations/auth";
import { success, handleApiError, HttpStatus } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    enforceRateLimit({
      key: `register:${getClientIp(req)}`,
      limit: 5,
      windowMs: 60_000,
    });
    const body = await req.json().catch(() => ({}));
    const input = registerSchema.parse(body);
    const result = await register(input);
    return success(
      result,
      "Account created. Please check your email to verify your account.",
      { status: HttpStatus.CREATED },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
