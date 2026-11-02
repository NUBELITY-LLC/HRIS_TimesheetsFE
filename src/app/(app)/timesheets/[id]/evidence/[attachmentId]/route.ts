import { evidenceDownload } from "@/lib/api/download";
import { requireUser } from "@/lib/auth/session";
import { fetchOwnEvidenceLink } from "@/lib/timesheets/queries";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/timesheets/[id]/evidence/[attachmentId]">,
) {
  await requireUser();

  const { id, attachmentId } = await params;
  const evidence = await fetchOwnEvidenceLink(Number(id), Number(attachmentId));

  return evidenceDownload(evidence);
}
