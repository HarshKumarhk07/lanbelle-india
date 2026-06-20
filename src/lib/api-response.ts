import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getErrorMessage } from "@/lib/utils";

/** Standardized API envelope returned by every route handler. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: Record<string, unknown>;
}

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

/** Domain error that route handlers can throw to control the HTTP response. */
export class ApiError extends Error {
  status: HttpStatusCode;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: HttpStatusCode = HttpStatus.BAD_REQUEST,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function success<T>(
  data: T,
  message = "Success",
  init: { status?: HttpStatusCode; meta?: Record<string, unknown> } = {},
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, message, data, meta: init.meta },
    { status: init.status ?? HttpStatus.OK },
  );
}

export function failure(
  message: string,
  status: HttpStatusCode = HttpStatus.BAD_REQUEST,
  errors?: Record<string, string[]>,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, message, errors },
    { status },
  );
}

/**
 * Converts any thrown value into a standardized error response. Handles Zod
 * validation errors, known ApiErrors and Mongo duplicate-key errors.
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof ApiError) {
    return failure(error.message, error.status, error.errors);
  }

  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "_";
      (errors[key] ??= []).push(issue.message);
    }
    return failure("Validation failed", HttpStatus.UNPROCESSABLE, errors);
  }

  // Mongo duplicate key
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  ) {
    const field = Object.keys(
      (error as { keyPattern?: Record<string, unknown> }).keyPattern ?? {},
    )[0];
    return failure(
      field ? `${field} already exists` : "Duplicate entry",
      HttpStatus.CONFLICT,
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("[API_ERROR]", error);
  }

  return failure(getErrorMessage(error), HttpStatus.INTERNAL);
}
