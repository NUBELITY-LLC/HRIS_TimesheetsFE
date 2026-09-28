import "server-only";

import { API_BASE_URL } from "./config";
import { getSessionToken } from "@/lib/auth/session";

export const EXPORT_FORMATS = ["xlsx", "pdf"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export function isExportFormat(value: string): value is ExportFormat {
  return (EXPORT_FORMATS as readonly string[]).includes(value);
}

const PASSTHROUGH_HEADERS = ["content-type", "content-disposition"];

export async function proxyDownload(path: string): Promise<Response> {
  const token = await getSessionToken();

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }

  if (!upstream.ok) {
    return new Response("Not found", { status: upstream.status === 403 ? 403 : 404 });
  }

  const headers = new Headers({ "Cache-Control": "no-store" });
  for (const name of PASSTHROUGH_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, { status: 200, headers });
}
