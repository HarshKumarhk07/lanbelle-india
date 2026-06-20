import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

interface ApiClientError {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Maps a standardized API error onto react-hook-form fields. Returns the
 * top-level message for toast display.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): string {
  const err = error as ApiClientError;
  if (err?.errors) {
    for (const [field, messages] of Object.entries(err.errors)) {
      if (messages?.length) {
        setError(field as Path<T>, { type: "server", message: messages[0] });
      }
    }
  }
  return err?.message ?? "Something went wrong. Please try again.";
}
