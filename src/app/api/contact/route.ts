import { type NextRequest } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { sendEmail } from "@/services/email.service";
import { success, handleApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";

export async function POST(req: NextRequest) {
  try {
    enforceRateLimit({
      key: `contact:${getClientIp(req)}`,
      limit: 5,
      windowMs: 60_000,
    });
    const body = await req.json().catch(() => ({}));
    const input = contactSchema.parse(body);

    await sendEmail({
      to: { email: siteConfig.email, name: siteConfig.name },
      subject: `Contact form: ${input.subject || "New message"}`,
      html: `<p><strong>From:</strong> ${input.name} (${input.email})</p>
             <p><strong>Subject:</strong> ${input.subject || "—"}</p>
             <p>${input.message.replace(/\n/g, "<br>")}</p>`,
    });

    return success(null, "Thanks for reaching out — we'll reply shortly.");
  } catch (error) {
    return handleApiError(error);
  }
}
