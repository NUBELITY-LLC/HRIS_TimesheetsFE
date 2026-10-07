import { requireUser } from "@/lib/auth/session";
import { isExportFormat, proxyDownload } from "@/lib/api/download";
import { canViewHoursReports } from "@/lib/users/roles";

const FORWARDED = ["from", "to", "companyId", "projectId"];

export async function GET(
  request: Request,
  { params }: RouteContext<"/reports/[id]/export/[format]">,
) {
  const user = await requireUser();
  const { id, format } = await params;
  const userId = Number(id);

  if (
    !canViewHoursReports(user) ||
    !Number.isInteger(userId) ||
    userId <= 0 ||
    !isExportFormat(format)
  ) {
    return new Response("Not found", { status: 404 });
  }

  const source = new URL(request.url).searchParams;
  const query = new URLSearchParams({ userId: String(userId), format });

  for (const key of FORWARDED) {
    const value = source.get(key);
    if (value) query.set(key, value);
  }

  return proxyDownload(`/reports/hours/export?${query.toString()}`);
}
