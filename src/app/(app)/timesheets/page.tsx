import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, ChevronRightIcon } from "@/components/icons";
import { TimesheetStatusBadge } from "@/components/dashboard/timesheet-status-badge";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { fetchAssignments, fetchWeek } from "@/lib/timesheets/queries";
import { formatMinutes } from "@/lib/timesheets/rules";
import type { Timesheet } from "@/lib/timesheets/types";
import { currentWeekStartISO, formatWeekRange } from "@/lib/timesheets/week";
import { canSubmitTimesheets } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.timesheets.overview.title };
}

async function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
        <div>
          <h1 className="text-sm font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{body}</p>
        </div>
      </div>
    </div>
  );
}

function isSubmitted(timesheet: Timesheet | null): boolean {
  return timesheet !== null && timesheet.status !== "DRAFT";
}

export default async function TimesheetsPage() {
  const user = await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();

  if (!canSubmitTimesheets(user)) {
    return (
      <Notice
        title={t.timesheets.noAccessTitle}
        body={t.timesheets.noAccessBody}
      />
    );
  }

  const assignmentsResult = await fetchAssignments();

  if (!assignmentsResult.ok) {
    return (
      <Notice
        title={t.timesheets.loadErrorTitle}
        body={assignmentsResult.message}
      />
    );
  }

  const assignments = assignmentsResult.assignments;

  if (assignments.length === 0) {
    return (
      <Notice
        title={t.timesheets.noAssignmentsTitle}
        body={t.timesheets.noAssignmentsBody}
      />
    );
  }

  const weekStart = currentWeekStartISO();
  const weeks = await Promise.all(
    assignments.map(async (assignment) => {
      const week = await fetchWeek(assignment.id, weekStart);
      return { assignment, timesheet: week.ok ? week.timesheet : null };
    }),
  );

  const submitted = weeks.filter((row) => isSubmitted(row.timesheet)).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{t.timesheets.breadcrumb}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.timesheets.overview.title}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {t.timesheets.overview.intro(formatWeekRange(weekStart, locale))}
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-3.5">
          <h2 className="text-sm font-semibold text-ink">
            {t.timesheets.overview.listTitle}
          </h2>
          <p className="text-xs text-ink-muted">
            {t.timesheets.overview.progress(submitted, weeks.length)}
          </p>
        </header>

        <ul className="divide-y divide-line">
          {weeks.map(({ assignment, timesheet }) => {
            const href = `/timesheets/new?assignmentId=${assignment.id}&weekStart=${weekStart}`;
            const actionLabel =
              timesheet === null
                ? t.timesheets.overview.actions.start
                : timesheet.status === "DRAFT"
                  ? t.timesheets.overview.actions.resume
                  : timesheet.status === "REJECTED"
                    ? t.timesheets.overview.actions.fix
                    : t.timesheets.overview.actions.view;

            return (
              <li key={assignment.id}>
                <Link
                  href={href}
                  className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 transition-colors hover:bg-surface-muted/50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">
                      {assignment.project.name}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {assignment.client.name}
                      {assignment.company ? ` · ${assignment.company.name}` : ""}
                      {assignment.assignmentCode
                        ? ` · ${assignment.assignmentCode}`
                        : ""}
                    </span>
                  </span>

                  <span className="w-28 text-right font-semibold text-brand-600 tabular-nums">
                    {timesheet
                      ? formatMinutes(timesheet.totalMinutes)
                      : t.common.none}
                  </span>

                  <span className="w-36">
                    {timesheet ? (
                      <TimesheetStatusBadge status={timesheet.status} />
                    ) : (
                      <span className="inline-flex rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
                        {t.timesheets.overview.notStarted}
                      </span>
                    )}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-semibold text-ink-soft">
                    {actionLabel}
                    <ChevronRightIcon className="size-3.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
