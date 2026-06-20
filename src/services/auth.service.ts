import { connectDB } from "@/lib/db";
import { User, type IUser } from "@/models/user.model";
import { ApiError, HttpStatus } from "@/lib/api-response";
import { getServerEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";
import {
  signAccessToken,
  signRefreshToken,
  signActionToken,
  verifyActionToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "@/services/email.service";
import type { SessionUser } from "@/types";
import type {
  RegisterInput,
  LoginInput,
} from "@/lib/validations/auth";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: SessionUser;
  rememberMe: boolean;
}

function toSessionUser(user: Pick<
  IUser,
  "_id" | "name" | "email" | "role" | "avatar" | "phone" | "isEmailVerified"
>): SessionUser {
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

async function issueTokens(
  user: Pick<IUser, "_id" | "role" | "tokenVersion">,
  rememberMe: boolean,
): Promise<AuthTokens> {
  const env = getServerEnv();
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      userId: String(user._id),
      role: user.role,
      tokenVersion: user.tokenVersion,
    }),
    signRefreshToken(
      { userId: String(user._id), tokenVersion: user.tokenVersion },
      rememberMe ? env.JWT_REFRESH_EXPIRES_IN : "1d",
    ),
  ]);
  return { accessToken, refreshToken };
}

async function sendVerification(user: IUser): Promise<void> {
  const token = await signActionToken({
    userId: String(user._id),
    email: user.email,
    purpose: "verify-email",
  });
  const link = `${siteConfig.url}/verify-email?token=${token}`;
  await sendVerificationEmail({ email: user.email, name: user.name }, link);
}

/** Registers a new credentials user and dispatches a verification email. */
export async function register(input: RegisterInput): Promise<{ email: string }> {
  await connectDB();

  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new ApiError(
      "An account with this email already exists",
      HttpStatus.CONFLICT,
    );
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    provider: "credentials",
  });

  await sendVerification(user);
  return { email: user.email };
}

/** Verifies an email token, activates the account, and logs the user in. */
export async function verifyEmail(token: string): Promise<AuthResult> {
  const claims = await verifyActionToken(token, "verify-email");
  if (!claims?.sub) {
    throw new ApiError(
      "This verification link is invalid or has expired",
      HttpStatus.BAD_REQUEST,
    );
  }

  await connectDB();
  const user = await User.findById(claims.sub);
  if (!user) throw new ApiError("Account not found", HttpStatus.NOT_FOUND);

  if (!user.isEmailVerified) {
    user.isEmailVerified = true;
    await user.save();
    await sendWelcomeEmail({ email: user.email, name: user.name });
  }

  const tokens = await issueTokens(user, true);
  return { ...tokens, user: toSessionUser(user), rememberMe: true };
}

/** Resends a verification email. Always resolves (no account enumeration). */
export async function resendVerification(email: string): Promise<void> {
  await connectDB();
  const user = await User.findOne({ email });
  if (user && !user.isEmailVerified && user.provider === "credentials") {
    await sendVerification(user);
  }
}

/** Authenticates a credentials user. */
export async function login(input: LoginInput): Promise<AuthResult> {
  await connectDB();

  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user || !user.password) {
    throw new ApiError("Invalid email or password", HttpStatus.UNAUTHORIZED);
  }

  const valid = await user.comparePassword(input.password);
  if (!valid) {
    throw new ApiError("Invalid email or password", HttpStatus.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new ApiError("This account has been disabled", HttpStatus.FORBIDDEN);
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      "Please verify your email before signing in",
      HttpStatus.FORBIDDEN,
    );
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueTokens(user, input.rememberMe ?? false);
  return {
    ...tokens,
    user: toSessionUser(user),
    rememberMe: input.rememberMe ?? false,
  };
}

/** Rotates the access token using a valid refresh token. */
export async function refresh(refreshToken: string): Promise<{
  accessToken: string;
  user: SessionUser;
}> {
  const claims = await verifyRefreshToken(refreshToken);
  if (!claims?.sub) {
    throw new ApiError("Invalid session", HttpStatus.UNAUTHORIZED);
  }

  await connectDB();
  const user = await User.findById(claims.sub);
  if (!user || !user.isActive || user.tokenVersion !== claims.tokenVersion) {
    throw new ApiError("Session expired, please sign in again", HttpStatus.UNAUTHORIZED);
  }

  const accessToken = await signAccessToken({
    userId: String(user._id),
    role: user.role,
    tokenVersion: user.tokenVersion,
  });
  return { accessToken, user: toSessionUser(user) };
}

/** Initiates password reset. Always resolves (no account enumeration). */
export async function forgotPassword(email: string): Promise<void> {
  await connectDB();
  const user = await User.findOne({ email });
  if (!user || user.provider !== "credentials") return;

  const token = await signActionToken({
    userId: String(user._id),
    email: user.email,
    purpose: "reset-password",
  });
  const link = `${siteConfig.url}/reset-password?token=${token}`;
  await sendPasswordResetEmail({ email: user.email, name: user.name }, link);
}

/** Completes a password reset, invalidating all existing sessions. */
export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  const claims = await verifyActionToken(token, "reset-password");
  if (!claims?.sub) {
    throw new ApiError(
      "This reset link is invalid or has expired",
      HttpStatus.BAD_REQUEST,
    );
  }

  await connectDB();
  const user = await User.findById(claims.sub).select("+password");
  if (!user) throw new ApiError("Account not found", HttpStatus.NOT_FOUND);

  user.password = password;
  user.tokenVersion += 1; // log out everywhere
  if (!user.isEmailVerified) user.isEmailVerified = true;
  await user.save();
}

interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

/** Exchanges a Google OAuth code for the user profile. */
async function fetchGoogleProfile(code: string): Promise<GoogleProfile> {
  const env = getServerEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new ApiError("Google sign-in is not configured", HttpStatus.BAD_REQUEST);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${siteConfig.url}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new ApiError("Google authentication failed", HttpStatus.UNAUTHORIZED);
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  if (!profileRes.ok) {
    throw new ApiError("Could not fetch Google profile", HttpStatus.UNAUTHORIZED);
  }
  return (await profileRes.json()) as GoogleProfile;
}

/** Signs a user in via Google, creating or linking the account. */
export async function googleAuth(code: string): Promise<AuthResult> {
  const profile = await fetchGoogleProfile(code);

  await connectDB();
  let user = await User.findOne({ email: profile.email });

  if (!user) {
    user = await User.create({
      name: profile.name || profile.email.split("@")[0],
      email: profile.email,
      provider: "google",
      googleId: profile.sub,
      avatar: profile.picture,
      isEmailVerified: true,
    });
    await sendWelcomeEmail({ email: user.email, name: user.name });
  } else {
    let dirty = false;
    if (!user.googleId) {
      user.googleId = profile.sub;
      dirty = true;
    }
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      dirty = true;
    }
    if (!user.avatar && profile.picture) {
      user.avatar = profile.picture;
      dirty = true;
    }
    user.lastLoginAt = new Date();
    if (dirty) await user.save();
    else await user.updateOne({ lastLoginAt: user.lastLoginAt });
  }

  const tokens = await issueTokens(user, true);
  return { ...tokens, user: toSessionUser(user), rememberMe: true };
}

export function getGoogleAuthUrl(state: string): string {
  const env = getServerEnv();
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: `${siteConfig.url}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
