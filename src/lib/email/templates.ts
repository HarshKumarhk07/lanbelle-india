import { siteConfig, shippingNotice } from "@/lib/site-config";
import type { OrderDTO } from "@/types";

interface EmailContent {
  subject: string;
  html: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const COLORS = {
  ink: "#2a2024",
  rose: "#c2566b",
  gold: "#b98b4e",
  cream: "#faf6f3",
  muted: "#7a6f73",
  border: "#ece5e2",
};

/** Shared branded email shell. */
function layout(opts: {
  heading: string;
  body: string;
  cta?: { label: string; href: string };
  footnote?: string;
}): string {
  const { heading, body, cta, footnote } = opts;
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${COLORS.cream};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${COLORS.ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cream};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${COLORS.border};border-radius:20px;overflow:hidden;">
        <tr><td style="padding:28px 36px 8px;">
          <span style="font-size:22px;font-weight:700;letter-spacing:-0.5px;color:${COLORS.rose};">${siteConfig.name}</span>
        </td></tr>
        <tr><td style="padding:8px 36px 0;">
          <h1 style="margin:12px 0 0;font-size:24px;line-height:1.25;color:${COLORS.ink};">${heading}</h1>
        </td></tr>
        <tr><td style="padding:16px 36px 8px;font-size:15px;line-height:1.65;color:${COLORS.muted};">
          ${body}
        </td></tr>
        ${
          cta
            ? `<tr><td style="padding:20px 36px 8px;">
                 <a href="${cta.href}" style="display:inline-block;background:${COLORS.rose};color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:9999px;">${cta.label}</a>
               </td></tr>
               <tr><td style="padding:6px 36px 0;font-size:12px;color:${COLORS.muted};word-break:break-all;">
                 Or paste this link into your browser:<br><a href="${cta.href}" style="color:${COLORS.gold};">${cta.href}</a>
               </td></tr>`
            : ""
        }
        ${
          footnote
            ? `<tr><td style="padding:18px 36px 0;font-size:12px;color:${COLORS.muted};">${footnote}</td></tr>`
            : ""
        }
        <tr><td style="padding:28px 36px 32px;">
          <hr style="border:none;border-top:1px solid ${COLORS.border};margin:0 0 16px;">
          <p style="margin:0;font-size:12px;color:${COLORS.muted};">
            100% authentic Korean skincare, imported directly from South Korea.<br>
            © ${new Date().getFullYear()} ${siteConfig.name}. ${siteConfig.address}.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function welcomeEmail(name: string): EmailContent {
  return {
    subject: `Welcome to ${siteConfig.name} ✨`,
    html: layout({
      heading: `Welcome, ${name}!`,
      body: `Your ${siteConfig.name} account is ready. Discover cult-favourite Korean skincare — sourced straight from Seoul in original sealed packaging — and enjoy that effortless glass-skin glow.`,
      cta: { label: "Start shopping", href: `${siteConfig.url}/shop` },
    }),
  };
}

export function verificationEmail(name: string, link: string): EmailContent {
  return {
    subject: `Verify your ${siteConfig.name} email`,
    html: layout({
      heading: "Confirm your email address",
      body: `Hi ${name}, please confirm your email to activate your ${siteConfig.name} account. This link expires in 1 hour.`,
      cta: { label: "Verify email", href: link },
      footnote: "If you didn't create this account, you can safely ignore this email.",
    }),
  };
}

export function orderConfirmationEmail(
  name: string,
  order: OrderDTO,
): EmailContent {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;font-size:14px;color:${COLORS.ink};">${i.name} × ${i.quantity}</td>
        <td style="padding:8px 0;font-size:14px;color:${COLORS.ink};text-align:right;">${inr(i.subtotal)}</td>
      </tr>`,
    )
    .join("");

  const summary = `
    <table role="presentation" width="100%" style="margin-top:8px;border-top:1px solid ${COLORS.border};">
      ${rows}
      <tr><td style="padding-top:12px;font-size:13px;color:${COLORS.muted};">Subtotal</td>
          <td style="padding-top:12px;font-size:13px;color:${COLORS.muted};text-align:right;">${inr(order.subtotal)}</td></tr>
      ${order.discount > 0 ? `<tr><td style="font-size:13px;color:${COLORS.muted};">Discount</td><td style="font-size:13px;color:${COLORS.muted};text-align:right;">– ${inr(order.discount)}</td></tr>` : ""}
      <tr><td style="font-size:13px;color:${COLORS.muted};">Shipping</td>
          <td style="font-size:13px;color:${COLORS.muted};text-align:right;">${order.shippingFee === 0 ? "Free" : inr(order.shippingFee)}</td></tr>
      <tr><td style="padding-top:8px;font-weight:700;color:${COLORS.ink};border-top:1px solid ${COLORS.border};">Total</td>
          <td style="padding-top:8px;font-weight:700;color:${COLORS.ink};text-align:right;border-top:1px solid ${COLORS.border};">${inr(order.total)}</td></tr>
    </table>`;

  const addr = order.shippingAddress;

  return {
    subject: `Order confirmed — ${order.orderNumber}`,
    html: layout({
      heading: "Thank you for your purchase!",
      body: `Hi ${name}, your order <strong>${order.orderNumber}</strong> is confirmed.
        <br><br>${shippingNotice.confirmation}
        ${summary}
        <br><strong style="color:${COLORS.ink};">Shipping to</strong><br>
        ${addr.fullName}, ${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city}, ${addr.state} ${addr.pincode}, ${addr.country}`,
      cta: {
        label: "Track your order",
        href: `${siteConfig.url}/account/orders/${order.id}`,
      },
    }),
  };
}

export function passwordResetEmail(name: string, link: string): EmailContent {
  return {
    subject: `Reset your ${siteConfig.name} password`,
    html: layout({
      heading: "Reset your password",
      body: `Hi ${name}, we received a request to reset your password. This link expires in 1 hour.`,
      cta: { label: "Reset password", href: link },
      footnote:
        "If you didn't request this, ignore this email — your password won't change.",
    }),
  };
}
