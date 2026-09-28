import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon } from "@/components/icons";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { DecisionsTable } from "@/components/history/decisions-table";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  DEFAULT_HISTORY_FILTERS,
  fetchAllTimesheetHistory,
} from "@/lib/timesheets/queries";
import {
  TIMESHEET_STATUSES,
  type TimesheetStatus,
} from "@/lib/timesheets/types";
import { fetchAllDecisionHistory } from "@/lib/approvals/queries";
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

function parseStatus(
  params: Record<string, string | string[] | undefined>,
): TimesheetStatus | "all" {
  const status = firstParam(params.status);

  return (
    STATUS_OPTIONS.find((candidate) => candidate === status) ??
    DEFAULT_HISTORY_FILTERS.status
  );
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
  const status = parseStatus(params);
  const tab =
    firstParam(params.tab) === "decisions" || !submits
      ? "decisions"
      : "submissions";

  const [result, decisions] = await Promise.all([
    tab === "submissions" && submits
      ? fetchAllTimesheetHistory(status)
      : Promise.resolve(null),
    tab === "decisions" && reviews
      ? fetchAllDecisionHistory()
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
              href={`/history?tab=${option}`}
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
          {STATUS_OPTIONS.map((option) => {
            const active = option === status;

            return (
              <Link
                key={option}
                href={`/history?tab=submissions&status=${option}`}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-line bg-surface text-ink-soft hover:bg-surface-muted"
                }`}
              >
                {option === "all"
                  ? t.history.filterAll
                  : t.timesheetStatus[option]}
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
            <p className="text-sm text-ink-muted">
              {t.history.decisions.summary(decisions.decisions.length)}
            </p>
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

          <p className="text-sm text-ink-muted">
            {t.history.summary(result.submissions.length)}
          </p>
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
