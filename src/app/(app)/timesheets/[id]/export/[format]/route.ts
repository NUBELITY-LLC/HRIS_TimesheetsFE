import { requireUser } from "@/lib/auth/session";
import { isExportFormat, proxyDownload } from "@/lib/api/download";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/timesheets/[id]/export/[format]">,
) {
  await requireUser();

  const { id, format } = await params;
  const timesheetId = Number(id);

  if (!Number.isInteger(timesheetId) || timesheetId <= 0 || !isExportFormat(format)) {
    return new Response("Not found", { status: 404 });
  }

  return proxyDownload(`/timesheets/${timesheetId}/export?format=${format}`);
}
