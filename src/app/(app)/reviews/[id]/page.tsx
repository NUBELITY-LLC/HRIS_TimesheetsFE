import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, ArrowLeftIcon } from "@/components/icons";
import { ReviewDetail } from "@/components/reviews/review-detail";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { fetchTimesheetReview } from "@/lib/timesheets/queries";
import { canReviewTimesheets, roleName } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.reviews.title };
}

async function Notice({ title, body }: { title: string; body: string }) {
  const t = await getDictionary();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
        <div>
          <h1 className="text-sm font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{body}</p>
          <Link
            href="/reviews"
            className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ArrowLeftIcon className="size-4" />
            {t.reviews.back}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function ReviewDetailPage({
  params,
}: PageProps<"/reviews/[id]">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canReviewTimesheets(actor.role.code)) {
    return (
      <Notice
        title={t.reviews.noAccessTitle}
        body={t.reviews.noAccessBody(roleName(actor.role.code, t))}
      />
    );
  }

  const { id } = await params;
  const review = await fetchTimesheetReview(id);

  if (!review) {
    return <Notice title={t.reviews.notFoundTitle} body={t.reviews.notFoundBody} />;
  }

  return <ReviewDetail review={review} />;
}
