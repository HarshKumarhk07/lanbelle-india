import { ApiError, HttpStatus } from "@/lib/api-response";

/**
 * Lightweight in-memory fixed-window rate limiter. Suitable for single-instance
 * deployments and protecting auth endpoints from brute force. For multi-region
 * scale, swap the store for Redis/Upstash behind the same interface.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

interface RateLimitOptions {
  /** Unique key, e.g. `login:<ip>`. */
  key: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): {
  success: boolean;
  remaining: number;
  retryAfter: number;
} {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  const success = bucket.count <= limit;
  return {
    success,
    remaining: Math.max(0, limit - bucket.count),
    retryAfter: success ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/** Throws a 429 ApiError if the limit is exceeded. */
export function enforceRateLimit(options: RateLimitOptions): void {
  const result = rateLimit(options);
  if (!result.success) {
    throw new ApiError(
      `Too many attempts. Try again in ${result.retryAfter}s.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/** Extracts a best-effort client IP from request headers. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Periodic cleanup to bound memory.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
  }, 60_000);
  // Don't keep the event loop alive solely for cleanup.
  (timer as { unref?: () => void }).unref?.();
}
