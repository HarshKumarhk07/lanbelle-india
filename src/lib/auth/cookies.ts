import { cookies } from "next/headers";
import { isProd } from "@/lib/env";

export const ACCESS_COOKIE = "lanbel_access";
export const REFRESH_COOKIE = "lanbel_refresh";
export const OAUTH_STATE_COOKIE = "lanbel_oauth_state";

const ACCESS_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const REFRESH_MAX_AGE_SHORT = 60 * 60 * 24; // 1 day (no "remember me")

const baseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

/** Writes access + refresh cookies. `rememberMe` extends refresh lifetime. */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  rememberMe = false,
): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: ACCESS_MAX_AGE,
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: rememberMe ? REFRESH_MAX_AGE : REFRESH_MAX_AGE_SHORT,
  });
}

export async function setAccessCookie(accessToken: string): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: ACCESS_MAX_AGE,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", { ...baseOptions, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...baseOptions, maxAge: 0 });
}

export async function readAuthCookies(): Promise<{
  accessToken?: string;
  refreshToken?: string;
}> {
  const store = await cookies();
  return {
    accessToken: store.get(ACCESS_COOKIE)?.value,
    refreshToken: store.get(REFRESH_COOKIE)?.value,
  };
}

export { REFRESH_MAX_AGE, REFRESH_MAX_AGE_SHORT };
