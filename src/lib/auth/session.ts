import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";
import { readAuthCookies } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ApiError, HttpStatus } from "@/lib/api-response";
import type { SessionUser } from "@/types";

/**
 * Resolves the authenticated user from the access-token cookie. Returns null
 * when unauthenticated or when the token is stale (tokenVersion mismatch /
 * deactivated account). Safe to call in Server Components and route handlers.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const { accessToken } = await readAuthCookies();
  if (!accessToken) return null;

  const claims = await verifyAccessToken(accessToken);
  if (!claims?.sub) return null;

  await connectDB();
  const user = await User.findById(claims.sub)
    .select("name email role avatar phone isEmailVerified isActive tokenVersion")
    .lean();

  if (!user || !user.isActive) return null;
  if (user.tokenVersion !== claims.tokenVersion) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
  };
}

/** Returns the session user or throws 401. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError("Authentication required", HttpStatus.UNAUTHORIZED);
  }
  return user;
}

/** Returns the session user if admin, otherwise throws 401/403. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new ApiError("Admin access required", HttpStatus.FORBIDDEN);
  }
  return user;
}
