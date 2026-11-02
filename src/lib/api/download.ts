import "server-only";

import { clientContextHeaders } from "./client-context";
import { API_BASE_URL } from "./config";
import { getSessionToken } from "@/lib/auth/session";

export const EXPORT_FORMATS = ["xlsx", "pdf"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export function isExportFormat(value: string): value is ExportFormat {
  return (EXPORT_FORMATS as readonly string[]).includes(value);
}

const PASSTHROUGH_HEADERS = ["content-type", "content-disposition"];

export async function proxyDownload(
  path: string,
  { timeoutMs = 30_000 }: { timeoutMs?: number } = {},
): Promise<Response> {
  const token = await getSessionToken();

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        ...(await clientContextHeaders()),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
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

export type EvidenceFile = { url: string; fileName: string; mimeType: string };

function attachmentDisposition(fileName: string): string {
  const fallback = fileName.replace(/[^\x20-\x7E]|["\\]/g, "_");
  const encoded = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function evidenceDownload(
  evidence: EvidenceFile | null,
  { timeoutMs = 30_000 }: { timeoutMs?: number } = {},
): Promise<Response> {
  if (!evidence) return new Response("Not found", { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetch(evidence.url, {
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }

  if (!upstream.ok) return new Response("Not found", { status: 404 });

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": evidence.mimeType,
      "Content-Disposition": attachmentDisposition(evidence.fileName),
      "Cache-Control": "no-store",
    },
  });
}
