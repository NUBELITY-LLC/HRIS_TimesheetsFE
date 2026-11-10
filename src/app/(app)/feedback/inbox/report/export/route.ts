import { getLocale } from "@/i18n/server";
import { proxyDownload } from "@/lib/api/download";
import { requireUser } from "@/lib/auth/session";
import { parseFeedbackFilters } from "@/lib/feedback/filters";
import { canReviewFeedback } from "@/lib/users/roles";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!canReviewFeedback(user)) return new Response("Not found", { status: 404 });

  const filters = parseFeedbackFilters(Object.fromEntries(new URL(request.url).searchParams));
  const query = new URLSearchParams();
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  if (filters.category) query.set("categories", filters.category);
  query.set("locale", await getLocale());

  return proxyDownload(`/feedback/cases/report/export?${query.toString()}`);
}
