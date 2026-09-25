import type { Metadata } from "next";

import Link from "next/link";

import { AlertIcon, ArrowLeftIcon } from "@/components/icons";
import { DraftsPanel } from "@/components/timesheets/drafts-panel";
import { WeeklyTimesheetForm } from "@/components/timesheets/weekly-timesheet-form";
import { WeekStatusPanel } from "@/components/timesheets/week-status-panel";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  fetchAssignments,
  fetchDrafts,
  fetchWeek,
} from "@/lib/timesheets/queries";
import { currentWeekStartISO, weekStartFromISO } from "@/lib/timesheets/week";
import { canSubmitTimesheets } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.timesheets.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
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

export default async function TimesheetsPage({
  searchParams,
}: PageProps<"/timesheets/new">) {
  const user = await requireUser();
  const t = await getDictionary();

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

  const params = await searchParams;
  const requestedCompanyId = firstParam(params.company);
  const companyId = assignments.some(
    (item) => String(item.company?.id ?? "") === requestedCompanyId,
  )
    ? requestedCompanyId
    : "";

  const scoped = companyId
    ? assignments.filter((item) => String(item.company?.id ?? "") === companyId)
    : assignments;

  const requestedId = Number(firstParam(params.assignmentId));
  const assignment =
    scoped.find((item) => item.id === requestedId) ?? scoped[0];

  const currentWeekStart = currentWeekStartISO();
  const weekStart =
    weekStartFromISO(firstParam(params.weekStart)) ?? currentWeekStart;

  const [week, drafts] = await Promise.all([
    fetchWeek(assignment.id, weekStart),
    fetchDrafts(),
  ]);
  const timesheet = week.ok ? week.timesheet : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <Link
          href="/timesheets"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {t.timesheets.backToOverview}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          {t.timesheets.title}
        </h1>
      </header>

      {week.ok ? null : (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <p className="font-medium">{week.message}</p>
        </div>
      )}

      <WeeklyTimesheetForm
        key={`${assignment.id}:${weekStart}`}
        assignments={assignments}
        assignmentId={assignment.id}
        companyId={companyId}
        weekStart={weekStart}
        currentWeekStart={currentWeekStart}
        timesheet={timesheet}
        statusPanel={
          timesheet ? <WeekStatusPanel timesheet={timesheet} /> : null
        }
      />

      <DraftsPanel
        drafts={drafts}
        currentAssignmentId={assignment.id}
        currentWeekStart={weekStart}
        companyId={companyId}
      />
    </div>
  );
}
