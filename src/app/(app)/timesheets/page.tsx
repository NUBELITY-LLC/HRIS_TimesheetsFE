import type { Metadata } from "next";

import { AlertIcon } from "@/components/icons";
import { WeeklyTimesheetForm } from "@/components/timesheets/weekly-timesheet-form";
import { WeekStatusPanel } from "@/components/timesheets/week-status-panel";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { fetchAssignments, fetchWeek } from "@/lib/timesheets/queries";
import { currentWeekStartISO, weekStartFromISO } from "@/lib/timesheets/week";
import { canSubmitTimesheets, roleName } from "@/lib/users/roles";

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
}: PageProps<"/timesheets">) {
  const user = await requireUser();
  const t = await getDictionary();

  if (!canSubmitTimesheets(user.role.code)) {
    return (
      <Notice
        title={t.timesheets.noAccessTitle}
        body={t.timesheets.noAccessBody(roleName(user.role.code, t))}
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
  const requestedId = Number(firstParam(params.assignmentId));
  const assignment =
    assignments.find((item) => item.id === requestedId) ?? assignments[0];

  const currentWeekStart = currentWeekStartISO();
  const weekStart =
    weekStartFromISO(firstParam(params.weekStart)) ?? currentWeekStart;

  const week = await fetchWeek(assignment.id, weekStart);
  const timesheet = week.ok ? week.timesheet : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">
          {t.timesheets.breadcrumb} / {t.timesheets.breadcrumbCurrent}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
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
        weekStart={weekStart}
        currentWeekStart={currentWeekStart}
        timesheet={timesheet}
        statusPanel={
          timesheet ? <WeekStatusPanel timesheet={timesheet} /> : null
        }
      />
    </div>
  );
}
