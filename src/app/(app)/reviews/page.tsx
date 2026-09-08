import type { Metadata } from "next";

import { AlertIcon } from "@/components/icons";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { fetchPendingReviews } from "@/lib/timesheets/queries";
import { canReviewTimesheets, roleName } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.reviews.title };
}

export default async function ReviewsPage() {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canReviewTimesheets(actor.role.code)) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <div>
            <h1 className="text-sm font-semibold text-ink">
              {t.reviews.noAccessTitle}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {t.reviews.noAccessBody(roleName(actor.role.code, t))}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const submissions = await fetchPendingReviews();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{t.reviews.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.reviews.title}
        </h1>
      </header>

      <SubmissionsTable
        title={t.reviews.listTitle}
        submissions={submissions}
        action="review"
        showOwner
        empty={{ title: t.reviews.emptyTitle, body: t.reviews.emptyBody }}
      />
    </div>
  );
}
