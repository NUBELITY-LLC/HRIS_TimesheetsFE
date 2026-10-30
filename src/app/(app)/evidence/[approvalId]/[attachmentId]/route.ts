import { evidenceDownload } from "@/lib/api/download";
import { requireUser } from "@/lib/auth/session";
import { fetchEvidenceLink } from "@/lib/approvals/queries";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/evidence/[approvalId]/[attachmentId]">,
) {
  await requireUser();

  const { approvalId, attachmentId } = await params;
  const evidence = await fetchEvidenceLink(Number(approvalId), Number(attachmentId));

  return evidenceDownload(evidence);
}
