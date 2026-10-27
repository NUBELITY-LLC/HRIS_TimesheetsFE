import { getLocale } from "@/i18n/server";
import { proxyDownload } from "@/lib/api/download";
import {
  auditApiParams,
  parseAuditColumns,
  parseAuditFilters,
} from "@/lib/audit/filters";
import { requireUser } from "@/lib/auth/session";
import { canViewAudit } from "@/lib/users/roles";

export async function GET(request: Request) {
  const user = await requireUser();

  if (!canViewAudit(user)) {
    return new Response("Not found", { status: 404 });
  }

  const source = new URL(request.url).searchParams;
  const params: Record<string, string[]> = {};
  for (const [key, value] of source.entries()) {
    (params[key] ??= []).push(value);
  }

  const query = auditApiParams(parseAuditFilters(params));
  const columns = parseAuditColumns(params.columns);
  if (columns.length) query.set("columns", columns.join(","));
  if (source.get("changeDetail") === "1") query.set("changeDetail", "1");
  query.set("locale", await getLocale());

  return proxyDownload(`/audit/entries/export?${query.toString()}`, {
    timeoutMs: 120_000,
  });
}
