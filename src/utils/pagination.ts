import type { Pagination } from "@/types";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 100;

/** Coerces raw query inputs into safe, bounded page/limit/skip values. */
export function resolvePaging(
  page?: number | string,
  limit?: number | string,
): { page: number; limit: number; skip: number } {
  const p = Math.max(DEFAULT_PAGE, Math.trunc(Number(page)) || DEFAULT_PAGE);
  const l = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.trunc(Number(limit)) || DEFAULT_LIMIT),
  );
  return { page: p, limit: l, skip: (p - 1) * l };
}

/** Builds a standardized pagination metadata object. */
export function buildPagination(
  total: number,
  page: number,
  limit: number,
): Pagination {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
