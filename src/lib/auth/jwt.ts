import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { getServerEnv } from "@/lib/env";

/** Isomorphic (Node + Edge) JWT helpers built on `jose` (HS256). */

export type TokenPurpose = "access" | "refresh" | "verify-email" | "reset-password";

export interface AccessTokenClaims extends JWTPayload {
  sub: string;
  role: "user" | "admin";
  tokenVersion: number;
  purpose: "access";
}

export interface RefreshTokenClaims extends JWTPayload {
  sub: string;
  tokenVersion: number;
  purpose: "refresh";
}

export interface ActionTokenClaims extends JWTPayload {
  sub: string;
  email: string;
  purpose: "verify-email" | "reset-password";
}

const encoder = new TextEncoder();
const key = (secret: string) => encoder.encode(secret);

async function sign(
  payload: JWTPayload,
  secret: string,
  expiresIn: string,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key(secret));
}

async function verify<T extends JWTPayload>(
  token: string,
  secret: string,
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, key(secret));
    return payload as T;
  } catch {
    return null;
  }
}

export function signAccessToken(claims: {
  userId: string;
  role: "user" | "admin";
  tokenVersion: number;
}): Promise<string> {
  const env = getServerEnv();
  return sign(
    { sub: claims.userId, role: claims.role, tokenVersion: claims.tokenVersion, purpose: "access" },
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN,
  );
}

export function signRefreshToken(
  claims: { userId: string; tokenVersion: number },
  expiresIn?: string,
): Promise<string> {
  const env = getServerEnv();
  return sign(
    { sub: claims.userId, tokenVersion: claims.tokenVersion, purpose: "refresh" },
    env.JWT_REFRESH_SECRET,
    expiresIn ?? env.JWT_REFRESH_EXPIRES_IN,
  );
}

export function verifyAccessToken(token: string): Promise<AccessTokenClaims | null> {
  return verify<AccessTokenClaims>(token, getServerEnv().JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token: string): Promise<RefreshTokenClaims | null> {
  return verify<RefreshTokenClaims>(token, getServerEnv().JWT_REFRESH_SECRET);
}

export function signActionToken(claims: {
  userId: string;
  email: string;
  purpose: "verify-email" | "reset-password";
  expiresIn?: string;
}): Promise<string> {
  const env = getServerEnv();
  return sign(
    { sub: claims.userId, email: claims.email, purpose: claims.purpose },
    env.AUTH_TOKEN_SECRET,
    claims.expiresIn ?? "1h",
  );
}

export async function verifyActionToken(
  token: string,
  purpose: "verify-email" | "reset-password",
): Promise<ActionTokenClaims | null> {
  const claims = await verify<ActionTokenClaims>(
    token,
    getServerEnv().AUTH_TOKEN_SECRET,
  );
  if (!claims || claims.purpose !== purpose) return null;
  return claims;
}
