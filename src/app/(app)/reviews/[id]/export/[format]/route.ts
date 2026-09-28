import { requireUser } from "@/lib/auth/session";
import { isExportFormat, proxyDownload } from "@/lib/api/download";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/reviews/[id]/export/[format]">,
) {
  await requireUser();

  const { id, format } = await params;
  const approvalId = Number(id);

  if (!Number.isInteger(approvalId) || approvalId <= 0 || !isExportFormat(format)) {
    return new Response("Not found", { status: 404 });
  }

  return proxyDownload(`/approvals/${approvalId}/export?format=${format}`);
}
