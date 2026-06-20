import * as brevo from "@getbrevo/brevo";
import { getServerEnv, isDev } from "@/lib/env";
import {
  welcomeEmail,
  verificationEmail,
  passwordResetEmail,
  orderConfirmationEmail,
} from "@/lib/email/templates";
import type { OrderDTO } from "@/types";

interface SendArgs {
  to: { email: string; name?: string };
  subject: string;
  html: string;
}

let cachedApi: brevo.TransactionalEmailsApi | null = null;

function getApi(apiKey: string): brevo.TransactionalEmailsApi {
  if (cachedApi) return cachedApi;
  const api = new brevo.TransactionalEmailsApi();
  api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  cachedApi = api;
  return api;
}

/**
 * Sends a transactional email via Brevo. When BREVO_API_KEY is not configured
 * (local dev), it logs the email instead of failing the request, so auth flows
 * remain testable without credentials.
 */
async function send({ to, subject, html }: SendArgs): Promise<void> {
  const env = getServerEnv();

  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) {
    if (isDev) {
      console.info(`[email:dev] → ${to.email} | ${subject}`);
    }
    return;
  }

  const message = new brevo.SendSmtpEmail();
  message.subject = subject;
  message.htmlContent = html;
  message.sender = { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME };
  message.to = [{ email: to.email, name: to.name }];

  await getApi(env.BREVO_API_KEY).sendTransacEmail(message);
}

export async function sendWelcomeEmail(to: {
  email: string;
  name: string;
}): Promise<void> {
  const { subject, html } = welcomeEmail(to.name);
  await send({ to, subject, html });
}

export async function sendVerificationEmail(
  to: { email: string; name: string },
  link: string,
): Promise<void> {
  const { subject, html } = verificationEmail(to.name, link);
  await send({ to, subject, html });
}

export async function sendPasswordResetEmail(
  to: { email: string; name: string },
  link: string,
): Promise<void> {
  const { subject, html } = passwordResetEmail(to.name, link);
  await send({ to, subject, html });
}

export async function sendOrderConfirmationEmail(
  to: { email: string; name: string },
  order: OrderDTO,
): Promise<void> {
  const { subject, html } = orderConfirmationEmail(to.name, order);
  await send({ to, subject, html });
}

export { send as sendEmail };
