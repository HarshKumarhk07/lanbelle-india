import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { googleAuth } from "@/services/auth.service";
import { setAuthCookies, OAUTH_STATE_COOKIE } from "@/lib/auth/cookies";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const savedState = store.get(OAUTH_STATE_COOKIE)?.value;
  store.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });

  try {
    if (!code || !state || state !== savedState) {
      throw new Error("invalid_state");
    }
    const { accessToken, refreshToken } = await googleAuth(code);
    await setAuthCookies(accessToken, refreshToken, true);
    return NextResponse.redirect(new URL("/account", origin));
  } catch {
    return NextResponse.redirect(new URL("/login?error=google", origin));
  }
}
