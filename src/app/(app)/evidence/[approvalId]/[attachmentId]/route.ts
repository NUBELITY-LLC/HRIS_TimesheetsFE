import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { fetchEvidenceLink } from "@/lib/approvals/queries";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/evidence/[approvalId]/[attachmentId]">,
) {
  await requireUser();

  const { approvalId, attachmentId } = await params;
  const url = await fetchEvidenceLink(Number(approvalId), Number(attachmentId));

  if (!url) {
    return new Response("Not found", { status: 404 });
  }

  redirect(url);
}
