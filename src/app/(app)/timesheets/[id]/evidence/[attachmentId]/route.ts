import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { fetchOwnEvidenceLink } from "@/lib/timesheets/queries";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/timesheets/[id]/evidence/[attachmentId]">,
) {
  await requireUser();

  const { id, attachmentId } = await params;
  const url = await fetchOwnEvidenceLink(Number(id), Number(attachmentId));

  if (!url) {
    return new Response("Not found", { status: 404 });
  }

  redirect(url);
}
