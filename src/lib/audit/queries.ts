import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { Pagination } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";
import { AUDIT_PAGE_SIZE, auditApiParams, type AuditFilters } from "./filters";
import type { AuditEntry, AuditOptions } from "./types";

export type AuditEntriesResult =
  | { ok: true; entries: AuditEntry[]; pagination: Pagination }
  | { ok: false; message: string };

export async function fetchAuditEntries(
  filters: AuditFilters,
): Promise<AuditEntriesResult> {
  const token = await getSessionToken();
  const params = auditApiParams(filters);
  params.set("page", String(filters.page));
  params.set("pageSize", String(AUDIT_PAGE_SIZE));

  const result = await apiRequest<AuditEntry[]>(
    `/audit/entries?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    entries: result.data,
    pagination: result.pagination ?? {
      page: filters.page,
      pageSize: AUDIT_PAGE_SIZE,
      total: result.data.length,
      totalPages: 1,
    },
  };
}

export async function fetchAuditOptions(): Promise<AuditOptions> {
  const token = await getSessionToken();
  const result = await apiRequest<AuditOptions>("/audit/options", { token });

  return result.ok ? result.data : { actors: [], projects: [] };
}
