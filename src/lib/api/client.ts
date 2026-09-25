import "server-only";

import { API_BASE_URL } from "./config";
import { readPagination, type ApiErrorPayload, type Pagination } from "./types";

export type ApiResult<T> =
  | { ok: true; status: number; data: T; pagination: Pagination | null }
  | { ok: false; status: number; error: ApiErrorPayload };

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  timeoutMs?: number;
};

export const CLIENT_ERROR_CODES = {
  network: "NETWORK_ERROR",
  malformed: "MALFORMED_RESPONSE",
  timeout: "REQUEST_TIMEOUT",
} as const;

export const DEFAULT_TIMEOUT_MS = 15_000;
export const UPLOAD_TIMEOUT_MS = 60_000;

function isErrorBody(value: unknown): value is { error: ApiErrorPayload } {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return false;
  }
  const { error } = value as { error: unknown };
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as ApiErrorPayload).code === "string" &&
    typeof (error as ApiErrorPayload).message === "string"
  );
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "GET", body, token } = options;

  const multipart = body instanceof FormData;
  const timeoutMs =
    options.timeoutMs ?? (multipart ? UPLOAD_TIMEOUT_MS : DEFAULT_TIMEOUT_MS);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined && !multipart)
    headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : multipart
            ? (body as FormData)
            : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (isAbort(error)) throw error;

    if (isTimeout(error)) {
      return {
        ok: false,
        status: 0,
        error: {
          code: CLIENT_ERROR_CODES.timeout,
          message:
            "No pudimos contactar al servidor. Inténtalo de nuevo en un momento.",
        },
      };
    }

    return {
      ok: false,
      status: 0,
      error: {
        code: CLIENT_ERROR_CODES.network,
        message:
          "No pudimos contactar al servidor. Inténtalo de nuevo en un momento.",
      },
    };
  }

  const raw = await response.text();
  const payload: unknown = raw ? safeParse(raw) : null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: isErrorBody(payload)
        ? payload.error
        : {
            code: CLIENT_ERROR_CODES.malformed,
            message: "No pudimos completar la operación. Vuelve a intentarlo.",
          },
    };
  }

  if (typeof payload !== "object" || payload === null || !("data" in payload)) {
    return {
      ok: false,
      status: response.status,
      error: {
        code: CLIENT_ERROR_CODES.malformed,
        message: "No pudimos completar la operación. Vuelve a intentarlo.",
      },
    };
  }

  return {
    ok: true,
    status: response.status,
    data: (payload as { data: T }).data,
    pagination:
      "pagination" in payload
        ? readPagination((payload as { pagination: unknown }).pagination)
        : null,
  };
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && error.name === "TimeoutError";
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
