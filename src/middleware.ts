import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Edge middleware: applies Helmet-style security headers to every response and
 * gates authenticated areas. Token presence/validity is checked cheaply here
 * for redirect UX; authoritative role checks live in the server layouts.
 */

const PROTECTED_PREFIXES = ["/account", "/admin", "/checkout"];
const encoder = new TextEncoder();

async function isValid(token: string | undefined, secret?: string) {
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, encoder.encode(secret));
    return true;
  } catch {
    return false;
  }
}

function applySecurityHeaders(res: NextResponse) {
  const h = res.headers;
  h.set("X-DNS-Prefetch-Control", "on");
  h.set("X-Content-Type-Options", "nosniff");
  h.set("X-Frame-Options", "SAMEORIGIN");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
  );
  h.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected) {
    const access = req.cookies.get("lanbel_access")?.value;
    const refresh = req.cookies.get("lanbel_refresh")?.value;

    const authed =
      (await isValid(access, process.env.JWT_ACCESS_SECRET)) ||
      (await isValid(refresh, process.env.JWT_REFRESH_SECRET));

    if (!authed) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
  ],
};
