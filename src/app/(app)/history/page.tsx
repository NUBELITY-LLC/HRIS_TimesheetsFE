import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon } from "@/components/icons";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { DecisionsTable } from "@/components/history/decisions-table";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  DEFAULT_HISTORY_FILTERS,
  fetchTimesheetHistory,
  type HistoryFilters,
} from "@/lib/timesheets/queries";
import {
  TIMESHEET_STATUSES,
  type TimesheetStatus,
} from "@/lib/timesheets/types";
import { fetchDecisionHistory } from "@/lib/approvals/queries";
import {
  canReviewTimesheets,
  canSubmitTimesheets,
} from "@/lib/users/roles";

const STATUS_OPTIONS: (TimesheetStatus | "all")[] = [
  "all",
  ...TIMESHEET_STATUSES,
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.history.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): HistoryFilters {
  const page = Number(firstParam(params.page));
  const status = firstParam(params.status);

  return {
    ...DEFAULT_HISTORY_FILTERS,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    status:
      STATUS_OPTIONS.find((candidate) => candidate === status) ??
      DEFAULT_HISTORY_FILTERS.status,
  };
}

function href(filters: HistoryFilters, page: number): string {
  return `/history?tab=submissions&status=${filters.status}&page=${page}`;
}

export default async function HistoryPage({
  searchParams,
}: PageProps<"/history">) {
  const user = await requireUser();
  const t = await getDictionary();

  const submits = canSubmitTimesheets(user);
  const reviews = canReviewTimesheets(user);

  if (!submits && !reviews) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <div>
            <h1 className="text-sm font-semibold text-ink">
              {t.history.noAccessTitle}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {t.timesheets.noAccessBody}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const filters = parseFilters(params);
  const tab =
    firstParam(params.tab) === "decisions" || !submits
      ? "decisions"
      : "submissions";

  const [result, decisions] = await Promise.all([
    tab === "submissions" && submits
      ? fetchTimesheetHistory(filters)
      : Promise.resolve(null),
    tab === "decisions" && reviews
      ? fetchDecisionHistory({ page: filters.page, pageSize: filters.pageSize })
      : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">
          {tab === "submissions"
            ? t.history.eyebrow
            : t.history.reviewerEyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {tab === "submissions" ? t.history.title : t.history.reviewerTitle}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {tab === "submissions" ? t.history.intro : t.history.reviewerIntro}
        </p>
      </header>

      {submits && reviews ? (
        <nav
          className="flex gap-2 rounded-lg bg-surface-muted p-1"
          aria-label={t.history.tabsLabel}
        >
          {(["submissions", "decisions"] as const).map((option) => (
            <Link
              key={option}
              href={`/history?tab=${option}&page=1`}
              aria-current={tab === option ? "page" : undefined}
              className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-semibold transition-colors ${
                tab === option
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {t.history.tabs[option]}
            </Link>
          ))}
        </nav>
      ) : null}

      {tab === "submissions" ? (
        <nav
          className="flex flex-wrap gap-2"
          aria-label={t.history.filterLabel}
        >
          {STATUS_OPTIONS.map((status) => {
            const active = status === filters.status;

            return (
              <Link
                key={status}
                href={`/history?tab=submissions&status=${status}&page=1`}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-line bg-surface text-ink-soft hover:bg-surface-muted"
                }`}
              >
                {status === "all"
                  ? t.history.filterAll
                  : t.timesheetStatus[status]}
              </Link>
            );
          })}
        </nav>
      ) : null}

      {tab === "decisions" ? (
        decisions?.ok ? (
          <>
            <DecisionsTable
              decisions={decisions.decisions}
              empty={{
                title: t.history.decisions.emptyTitle,
                body: t.history.decisions.emptyBody,
              }}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-ink-muted">
                {t.history.decisions.summary(
                  decisions.pagination.total,
                  decisions.pagination.page,
                  Math.max(decisions.pagination.totalPages, 1),
                )}
              </p>
              <div className="flex gap-2">
                {decisions.pagination.page > 1 ? (
                  <Link
                    href={`/history?tab=decisions&page=${decisions.pagination.page - 1}`}
                    className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                  >
                    {t.common.previous}
                  </Link>
                ) : null}
                {decisions.pagination.page < decisions.pagination.totalPages ? (
                  <Link
                    href={`/history?tab=decisions&page=${decisions.pagination.page + 1}`}
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
            <p className="text-sm text-danger-700">
              {decisions?.message ?? t.history.loadErrorTitle}
            </p>
          </div>
        )
      ) : result?.ok ? (
        <>
          <SubmissionsTable
            title={t.history.listTitle}
            submissions={result.submissions}
            action="view"
            empty={{
              title: t.history.emptyTitle,
              body: t.history.emptyBody,
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-muted">
              {t.history.summary(
                result.pagination.total,
                result.pagination.page,
                Math.max(result.pagination.totalPages, 1),
              )}
            </p>
            <div className="flex gap-2">
              {result.pagination.page > 1 ? (
                <Link
                  href={href(filters, result.pagination.page - 1)}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.previous}
                </Link>
              ) : null}
              {result.pagination.page < result.pagination.totalPages ? (
                <Link
                  href={href(filters, result.pagination.page + 1)}
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
              {t.history.loadErrorTitle}
            </p>
            <p className="mt-1 text-sm text-danger-700">
              {result?.message ?? ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
