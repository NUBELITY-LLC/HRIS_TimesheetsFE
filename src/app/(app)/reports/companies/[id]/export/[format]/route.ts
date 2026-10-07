import { requireUser } from "@/lib/auth/session";
import { isExportFormat, proxyDownload } from "@/lib/api/download";
import { parsePeriodGroup } from "@/lib/reports/range";
import { canViewHoursReports } from "@/lib/users/roles";

export async function GET(
  request: Request,
  { params }: RouteContext<"/reports/companies/[id]/export/[format]">,
) {
  const user = await requireUser();
  const { id, format } = await params;
  const companyId = Number(id);

  if (
    !canViewHoursReports(user) ||
    !Number.isInteger(companyId) ||
    companyId <= 0 ||
    !isExportFormat(format)
  ) {
    return new Response("Not found", { status: 404 });
  }

  const source = new URL(request.url).searchParams;
  const query = new URLSearchParams({
    companyId: String(companyId),
    format,
    groupBy: parsePeriodGroup(source.get("groupBy") ?? ""),
    byProject: source.has("projectId") ? "1" : "0",
    byPerson: source.has("userId") ? "1" : "0",
  });

  for (const key of ["from", "to", "projectId", "userId"]) {
    const value = source.get(key);
    if (value) query.set(key, value);
  }

  return proxyDownload(`/reports/company/export?${query.toString()}`);
}
