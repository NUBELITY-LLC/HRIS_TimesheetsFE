import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon } from "@/components/icons";
import { PendingApprovalsTable } from "@/components/reviews/pending-approvals-table";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  DEFAULT_PENDING_APPROVAL_FILTERS,
  fetchPendingApprovals,
  type PendingApprovalFilters,
} from "@/lib/approvals/queries";
import { canReviewTimesheets } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.reviews.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): PendingApprovalFilters {
  const page = Number(firstParam(params.page));

  return {
    ...DEFAULT_PENDING_APPROVAL_FILTERS,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export default async function ReviewsPage({
  searchParams,
}: PageProps<"/reviews">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canReviewTimesheets(actor)) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <div>
            <h1 className="text-sm font-semibold text-ink">
              {t.reviews.noAccessTitle}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {t.reviews.noAccessBody}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filters = parseFilters(await searchParams);
  const result = await fetchPendingApprovals(filters);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{t.reviews.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.reviews.title}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">{t.reviews.intro}</p>
      </header>

      {result.ok ? (
        <>
          <PendingApprovalsTable
            title={t.reviews.listTitle}
            approvals={result.approvals}
            empty={{ title: t.reviews.emptyTitle, body: t.reviews.emptyBody }}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-muted">
              {t.reviews.summary(
                result.pagination.total,
                result.pagination.page,
                Math.max(result.pagination.totalPages, 1),
              )}
            </p>
            <div className="flex gap-2">
              {result.pagination.page > 1 ? (
                <Link
                  href={`/reviews?page=${result.pagination.page - 1}`}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.previous}
                </Link>
              ) : null}
              {result.pagination.page < result.pagination.totalPages ? (
                <Link
                  href={`/reviews?page=${result.pagination.page + 1}`}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.next}
                </Link>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger-600" />
          <div>
            <p className="text-sm font-semibold text-danger-700">
              {t.reviews.loadErrorTitle}
            </p>
            <p className="mt-1 text-sm text-danger-700">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
