import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGoogleAuthUrl } from "@/services/auth.service";
import { isProd } from "@/lib/env";
import { OAUTH_STATE_COOKIE } from "@/lib/auth/cookies";

export async function GET() {
  const state = crypto.randomUUID();
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(getGoogleAuthUrl(state));
}
