import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/lib/api-response";

/**
 * Browser-side Axios instance for calling internal route handlers.
 * Cookies (auth tokens) are sent automatically via `withCredentials`.
 */
export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

/** Unwraps the standardized envelope, throwing a readable error on failure. */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const data = error.response?.data;
    const message =
      data?.message ?? error.message ?? "Network request failed";
    return Promise.reject(
      Object.assign(new Error(message), {
        status: error.response?.status,
        errors: data?.errors,
      }),
    );
  },
);

/** Helper that returns the typed `data` payload from an API response. */
export async function apiGet<T>(url: string, params?: unknown): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  return res.data.data as T;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, body);
  return res.data.data as T;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.put<ApiResponse<T>>(url, body);
  return res.data.data as T;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.patch<ApiResponse<T>>(url, body);
  return res.data.data as T;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await apiClient.delete<ApiResponse<T>>(url);
  return res.data.data as T;
}
