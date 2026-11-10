import { evidenceDownload } from "@/lib/api/download";
import { requireUser } from "@/lib/auth/session";
import { fetchFeedbackEvidence } from "@/lib/feedback/queries";
import { canReviewFeedback } from "@/lib/users/roles";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/feedback/inbox/[id]/evidence/[attachmentId]">,
) {
  const user = await requireUser();
  if (!canReviewFeedback(user)) return new Response("Forbidden", { status: 403 });

  const { id, attachmentId } = await params;
  const evidence = await fetchFeedbackEvidence(Number(id), Number(attachmentId));

  return evidenceDownload(evidence);
}
