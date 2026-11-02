import { evidenceDownload } from "@/lib/api/download";
import { requireUser } from "@/lib/auth/session";
import { fetchTimesheetEvidenceLink } from "@/lib/approvals/queries";

export async function GET(
  _request: Request,
  {
    params,
  }: RouteContext<"/evidence/[approvalId]/timesheet/[attachmentId]">,
) {
  await requireUser();

  const { approvalId, attachmentId } = await params;
  const evidence = await fetchTimesheetEvidenceLink(
    Number(approvalId),
    Number(attachmentId),
  );

  return evidenceDownload(evidence);
}
