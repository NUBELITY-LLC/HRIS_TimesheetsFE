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
};

export const CLIENT_ERROR_CODES = {
  network: "NETWORK_ERROR",
  malformed: "MALFORMED_RESPONSE",
} as const;

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

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 0,
      error: {
        code: CLIENT_ERROR_CODES.network,
        message: `No se pudo contactar al backend en ${API_BASE_URL}`,
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
            message: `El backend respondio ${response.status} sin un cuerpo de error valido`,
          },
    };
  }

  if (typeof payload !== "object" || payload === null || !("data" in payload)) {
    return {
      ok: false,
      status: response.status,
      error: {
        code: CLIENT_ERROR_CODES.malformed,
        message: "El backend respondio sin la envoltura `data` esperada",
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

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
