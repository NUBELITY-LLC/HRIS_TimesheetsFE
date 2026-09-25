"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { useConfirm } from "@/components/ui/use-confirm";
import {
  AlertIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/components/icons";
import { useDictionary, useLocale } from "@/i18n/provider";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatProjectDate } from "@/lib/catalog/lifecycle";
import { saveTimesheetAction } from "@/lib/timesheets/actions";
import { approvalStepLabel } from "@/lib/timesheets/approvals";
import {
  INITIAL_TIMESHEET_FORM_STATE,
  type DraftDayPayload,
  type TimesheetFormState,
} from "@/lib/timesheets/form-state";
import {
  DAY_MAX_MINUTES,
  TASK_MAX_MINUTES,
  TASK_MIN_MINUTES,
  TASK_MINUTE_OPTIONS,
  formatMinutes,
  parseTaskMinutes,
} from "@/lib/timesheets/rules";
import type {
  Assignment,
  TaskEntry,
  Timesheet,
  WeekEntries,
} from "@/lib/timesheets/types";
import {
  formatDayAndMonth,
  formatWeekRange,
  formatWeekday,
  isWeekend,
  shiftWeekISO,
  toISODate,
  weekDates,
} from "@/lib/timesheets/week";

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted disabled:text-ink-muted";

const ERROR_FIELD_CLASS =
  "border-danger-600 focus:border-danger-600 focus:ring-danger-200";

type FormErrors = {
  days: Record<string, string>;
  rows: Record<string, string>;
  form?: string;
};

const NO_ERRORS: FormErrors = { days: {}, rows: {} };

export type WeeklyTimesheetFormProps = {
  assignments: Assignment[];
  assignmentId: number;
  companyId: string;
  weekStart: string;
  currentWeekStart: string;
  timesheet: Timesheet | null;
  statusPanel?: React.ReactNode;
};

function seedEntries(
  weekStart: string,
  timesheet: Timesheet | null,
): WeekEntries {
  const entries: WeekEntries = {};

  for (const date of weekDates(weekStart)) {
    const iso = toISODate(date);
    const saved = timesheet?.days?.find((day) => day.date === iso);
    const rows = (saved?.activities ?? []).map((activity, index) => ({
      id: `${iso}#${index}`,
      minutes: activity.minutes,
      activity: activity.activity,
    }));

    entries[iso] = rows.length
      ? rows
      : [{ id: `${iso}#0`, minutes: null, activity: "" }];
  }

  return entries;
}

function routingLines(state: TimesheetFormState, t: Dictionary): string[] {
  const lines: string[] = [];

  if (state.submissionCode) {
    lines.push(t.timesheets.submissionCode(state.submissionCode));
  }

  if (state.routedTo) {
    lines.push(t.timesheets.routedTo(approvalStepLabel(state.routedTo, t)));
  }

  const notifications = state.notifications;
  if (!notifications) return lines;

  if (notifications.inApp > 0) {
    lines.push(t.timesheets.routingInApp(notifications.inApp));
  }

  if (notifications.email > 0) {
    lines.push(t.timesheets.routingEmailSent);
  }

  return lines;
}

function hasErrors(errors: FormErrors): boolean {
  return Boolean(
    errors.form ||
    Object.keys(errors.days).length ||
    Object.keys(errors.rows).length,
  );
}

export function WeeklyTimesheetForm({
  assignments,
  assignmentId,
  companyId,
  weekStart,
  currentWeekStart,
  timesheet,
  statusPanel,
}: WeeklyTimesheetFormProps) {
  const t = useDictionary();
  const locale = useLocale();
  const router = useRouter();

  const [state, formAction, isSaving] = useActionState(
    saveTimesheetAction,
    INITIAL_TIMESHEET_FORM_STATE,
  );
  const [isNavigating, startNavigation] = useTransition();
  const { confirm, dialog } = useConfirm();
  const [entries, setEntries] = useState<WeekEntries>(() =>
    seedEntries(weekStart, timesheet),
  );
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [dirty, setDirty] = useState(false);
  const rowCounter = useRef(0);

  const editable = !timesheet || timesheet.editable;
  const busy = isSaving || isNavigating;

  const assignment =
    assignments.find((item) => item.id === assignmentId) ?? null;

  const companies = useMemo(() => {
    const seen = new Map<number, string>();
    for (const item of assignments) {
      if (item.company) seen.set(item.company.id, item.company.name);
    }
    return [...seen].map(([id, name]) => ({ id, name }));
  }, [assignments]);

  const companyAssignments = companyId
    ? assignments.filter((item) => String(item.company?.id ?? "") === companyId)
    : assignments;

  const projectEndDate = assignment?.project.endDate ?? null;
  const projectEndLabel = formatProjectDate(
    projectEndDate,
    locale,
    projectEndDate ?? "",
  );

  const days = useMemo(
    () =>
      weekDates(weekStart).map((date) => {
        const iso = toISODate(date);
        const rows = entries[iso] ?? [];

        return {
          date,
          iso,
          rows,
          weekend: isWeekend(date),
          minutes: rows.reduce((total, row) => total + (row.minutes ?? 0), 0),
        };
      }),
    [weekStart, entries],
  );

  function isAfterProjectEnd(iso: string): boolean {
    return Boolean(projectEndDate && iso > projectEndDate);
  }

  const totalMinutes = days.reduce((total, day) => total + day.minutes, 0);

  const payload: DraftDayPayload[] = days.flatMap((day) => {
    if (isAfterProjectEnd(day.iso)) return [];

    const activities = day.rows
      .filter((row) => row.minutes !== null)
      .map((row) => ({
        minutes: row.minutes as number,
        activity: row.activity.trim(),
      }));

    return activities.length ? [{ date: day.iso, activities }] : [];
  });

  const payloadJson = JSON.stringify(payload);
  const unsaved = dirty || state.status === "error";
  const pendingChanges = unsaved || isSaving;

  useEffect(() => {
    if (!pendingChanges) return;

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function confirmLeaving(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");
      const href = link?.getAttribute("href");

      if (!link || !href || href.startsWith("#") || link.target === "_blank") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      void confirm({
        title: t.timesheets.unsavedConfirm,
        confirmLabel: t.timesheets.leaveAnyway,
        tone: "danger",
      }).then((accepted) => {
        if (accepted) router.push(href);
      });
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", confirmLeaving, true);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", confirmLeaving, true);
    };
  }, [pendingChanges, t, confirm, router]);

  async function navigate(
    nextAssignmentId: number,
    nextWeekStart: string,
    nextCompanyId = companyId,
  ) {
    if (
      unsaved &&
      !(await confirm({
        title: t.timesheets.unsavedConfirm,
        confirmLabel: t.timesheets.leaveAnyway,
        tone: "danger",
      }))
    ) {
      return;
    }

    const query = new URLSearchParams({
      assignmentId: String(nextAssignmentId),
      weekStart: nextWeekStart,
    });
    if (nextCompanyId) query.set("company", nextCompanyId);

    startNavigation(() => {
      router.replace(`/timesheets/new?${query.toString()}`, { scroll: false });
    });
  }

  function createRow(iso: string): TaskEntry {
    rowCounter.current += 1;
    return { id: `${iso}#n${rowCounter.current}`, minutes: null, activity: "" };
  }

  function updateRow(iso: string, rowId: string, patch: Partial<TaskEntry>) {
    setEntries((prev) => ({
      ...prev,
      [iso]: (prev[iso] ?? []).map((row) =>
        row.id === rowId ? { ...row, ...patch } : row,
      ),
    }));
    setErrors(NO_ERRORS);
    setDirty(true);
  }

  function addRow(iso: string) {
    setEntries((prev) => ({
      ...prev,
      [iso]: [...(prev[iso] ?? []), createRow(iso)],
    }));
    setErrors(NO_ERRORS);
  }

  function removeRow(iso: string, rowId: string) {
    setEntries((prev) => {
      const rows = (prev[iso] ?? []).filter((row) => row.id !== rowId);
      return { ...prev, [iso]: rows.length ? rows : [createRow(iso)] };
    });
    setErrors(NO_ERRORS);
    setDirty(true);
  }

  function validate(intent: "draft" | "submit"): FormErrors {
    const next: FormErrors = { days: {}, rows: {} };
    let filledRows = 0;

    for (const day of days) {
      for (const row of day.rows) {
        const activity = row.activity.trim();
        if (row.minutes === null && !activity) continue;

        filledRows += 1;

        if (row.minutes === null) {
          next.rows[row.id] = t.timesheets.errors.hoursRequired;
        } else if (!activity && intent === "submit") {
          next.rows[row.id] = t.timesheets.errors.activityRequired;
        }
      }

      if (day.minutes > DAY_MAX_MINUTES) {
        next.days[day.iso] = t.timesheets.errors.dayLimit(
          formatMinutes(DAY_MAX_MINUTES),
        );
      }
    }

    if (intent === "submit" && filledRows === 0) {
      next.form = t.timesheets.errors.empty;
    }

    if (Object.keys(next.rows).length && !next.form) {
      next.form = t.timesheets.errors.review;
    }

    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(event.currentTarget);

    if (submitter instanceof HTMLButtonElement && submitter.name === "intent") {
      data.set("intent", submitter.value);
    }

    startTransition(() => formAction(data));
  }

  function guard(intent: "draft" | "submit") {
    return (event: React.MouseEvent<HTMLButtonElement>) => {
      const next = validate(intent);
      setErrors(next);

      if (hasErrors(next)) {
        event.preventDefault();
        return;
      }

      setDirty(false);
    };
  }

  const banner =
    state.status === "error"
      ? { tone: "error" as const, message: state.message, issues: state.issues }
      : errors.form
        ? { tone: "error" as const, message: errors.form, issues: [] }
        : state.status === "submitted"
          ? {
              tone: "success" as const,
              message: state.message,
              issues: routingLines(state, t),
            }
          : state.status === "draft"
            ? { tone: "info" as const, message: state.message, issues: [] }
            : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {dialog}
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="weekStart" value={weekStart} />
      <input type="hidden" name="days" value={payloadJson} />
      {assignment ? (
        <input
          type="hidden"
          name="projectStatus"
          value={assignment.project.status}
        />
      ) : null}

      {banner ? (
        <div
          role={banner.tone === "error" ? "alert" : "status"}
          aria-live={banner.tone === "error" ? "assertive" : "polite"}
          className={`flex gap-3 rounded-lg border p-3.5 text-sm ${
            banner.tone === "error"
              ? "border-danger-200 bg-danger-50 text-danger-700"
              : banner.tone === "success"
                ? "border-success-200 bg-success-50 text-success-800"
                : "border-line bg-surface-muted text-ink-soft"
          }`}
        >
          {banner.tone === "error" ? (
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckIcon className="mt-0.5 size-4 shrink-0" />
          )}
          <div className="space-y-1">
            <p className="font-medium">{banner.message}</p>
            {banner.issues.map((issue) => (
              <p key={issue} className="text-xs">
                {issue}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {statusPanel}

      <div className="grid gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label
            htmlFor="companyId"
            className="block text-sm font-medium text-ink-soft"
          >
            {t.timesheets.companyLabel}
          </label>
          <select
            id="companyId"
            value={companyId}
            disabled={busy || companies.length === 0}
            onChange={(event) => {
              const nextCompanyId = event.target.value;
              const keepsAssignment =
                !nextCompanyId ||
                String(assignment?.company?.id ?? "") === nextCompanyId;
              const next = keepsAssignment
                ? assignment
                : (assignments.find(
                    (item) => String(item.company?.id ?? "") === nextCompanyId,
                  ) ?? null);

              navigate(next?.id ?? assignmentId, weekStart, nextCompanyId);
            }}
            className={FIELD_CLASS}
          >
            <option value="">{t.timesheets.companyAll}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="projectId"
            className="block text-sm font-medium text-ink-soft"
          >
            {t.timesheets.projectLabel}
          </label>
          <select
            id="projectId"
            value={assignmentId}
            disabled={busy}
            onChange={(event) =>
              navigate(Number(event.target.value), weekStart)
            }
            className={FIELD_CLASS}
          >
            {companyAssignments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.project.name}
                {item.project.code ? ` (${item.project.code})` : ""}
                {item.assignmentCode ? ` · ${item.assignmentCode}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-ink-soft">
            {t.timesheets.clientLabel}
          </span>
          <p className="rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink-soft">
            {assignment?.client.name ?? t.common.none}
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-ink-soft">
            {t.common.assignmentCode}
          </span>
          <p className="rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink-soft">
            {assignment?.assignmentCode ?? t.common.none}
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-ink-soft">
            {t.timesheets.weekLabel}
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-line bg-white px-1.5 py-1">
            <button
              type="button"
              aria-label={t.timesheets.previousWeek}
              disabled={busy}
              onClick={() =>
                navigate(assignmentId, shiftWeekISO(weekStart, -1))
              }
              className="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-50"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <span className="flex min-w-0 flex-1 items-center justify-center gap-2 text-sm font-medium text-ink">
              {isNavigating ? (
                <SpinnerIcon className="size-4 shrink-0 animate-spin text-ink-muted" />
              ) : (
                <CalendarIcon className="size-4 shrink-0 text-ink-muted" />
              )}
              <span className="truncate">
                {formatWeekRange(weekStart, locale)}
              </span>
            </span>
            <button
              type="button"
              aria-label={t.timesheets.nextWeek}
              disabled={busy}
              onClick={() => navigate(assignmentId, shiftWeekISO(weekStart, 1))}
              className="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-50"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-ink-muted">{t.timesheets.weekHint}</p>
            {weekStart === currentWeekStart ? null : (
              <button
                type="button"
                disabled={busy}
                onClick={() => navigate(assignmentId, currentWeekStart)}
                className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                {t.timesheets.currentWeek}
              </button>
            )}
          </div>
        </div>
      </div>

      {projectEndDate ? (
        <p className="flex gap-2 rounded-xl border border-warn-200 bg-warn-50 p-3.5 text-sm text-warn-700">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {assignment?.project.status === "CLOSED"
            ? t.timesheets.projectClosedNotice(projectEndLabel)
            : t.timesheets.projectEndNotice(projectEndLabel)}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-muted px-5 py-3.5">
          <h2 className="text-sm font-semibold text-ink">
            {t.timesheets.tableTitle}
          </h2>
          <p className="text-xs text-ink-muted">
            {t.timesheets.tableRules(
              formatMinutes(TASK_MIN_MINUTES),
              formatMinutes(TASK_MAX_MINUTES),
              formatMinutes(DAY_MAX_MINUTES),
            )}
          </p>
        </header>

        <div className="hidden grid-cols-[8rem_1fr] gap-4 border-b border-line px-5 py-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase sm:grid">
          <span>{t.timesheets.columns.day}</span>
          <span className="flex gap-2">
            <span className="w-24 shrink-0">{t.timesheets.columns.hours}</span>
            <span>{t.timesheets.columns.activity}</span>
          </span>
        </div>

        <div className="divide-y divide-line">
          {days.map((day) => {
            const dayLabel = `${formatWeekday(day.date, locale)} ${formatDayAndMonth(day.date, locale)}`;
            const overLimit = day.minutes > DAY_MAX_MINUTES;
            const afterProjectEnd = isAfterProjectEnd(day.iso);
            const dayLocked = !editable || afterProjectEnd;

            return (
              <div
                key={day.iso}
                className={`grid gap-3 px-5 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4 ${
                  afterProjectEnd
                    ? "bg-surface-muted/60 opacity-60"
                    : day.weekend
                      ? "bg-surface-muted/60"
                      : ""
                }`}
              >
                <div className="flex items-center gap-2 sm:block">
                  <p className="text-sm font-semibold text-ink">
                    {formatWeekday(day.date, locale)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatDayAndMonth(day.date, locale)}
                  </p>
                  <p
                    title={t.timesheets.columns.dayTotal}
                    className={`ml-auto inline-flex rounded-md px-2 py-0.5 text-xs font-semibold sm:mt-2 sm:ml-0 ${
                      overLimit
                        ? "bg-danger-50 text-danger-700"
                        : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    {formatMinutes(day.minutes)}
                  </p>
                </div>

                <div className="space-y-2">
                  {day.rows.map((row) => {
                    const rowError = errors.rows[row.id];

                    return (
                      <div key={row.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <select
                            aria-label={t.timesheets.hoursAriaLabel(dayLabel)}
                            value={row.minutes ?? ""}
                            disabled={dayLocked || busy}
                            onChange={(event) =>
                              updateRow(day.iso, row.id, {
                                minutes: parseTaskMinutes(event.target.value),
                              })
                            }
                            className={`w-24 shrink-0 rounded-lg border border-line bg-white px-2 py-2 text-sm text-ink tabular-nums transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted disabled:text-ink-muted ${
                              rowError ? ERROR_FIELD_CLASS : ""
                            }`}
                          >
                            <option value="">
                              {t.timesheets.hoursPlaceholder}
                            </option>
                            {TASK_MINUTE_OPTIONS.map((minutes) => (
                              <option key={minutes} value={minutes}>
                                {formatMinutes(minutes)}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            maxLength={255}
                            aria-label={t.timesheets.activityAriaLabel(
                              dayLabel,
                            )}
                            placeholder={t.timesheets.activityPlaceholder}
                            value={row.activity}
                            disabled={dayLocked || busy}
                            onChange={(event) =>
                              updateRow(day.iso, row.id, {
                                activity: event.target.value,
                              })
                            }
                            className={`min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted disabled:text-ink-muted ${
                              rowError ? ERROR_FIELD_CLASS : ""
                            }`}
                          />

                          {editable && !afterProjectEnd ? (
                            <button
                              type="button"
                              aria-label={t.timesheets.removeTask}
                              title={t.timesheets.removeTask}
                              disabled={busy}
                              onClick={() => removeRow(day.iso, row.id)}
                              className="grid size-9 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600"
                            >
                              <TrashIcon className="size-4" />
                            </button>
                          ) : null}
                        </div>
                        {rowError ? (
                          <p className="text-xs text-danger-600">{rowError}</p>
                        ) : null}
                      </div>
                    );
                  })}

                  {afterProjectEnd ? (
                    <p className="text-xs text-ink-muted">
                      {t.timesheets.dayAfterProjectEnd}
                    </p>
                  ) : null}

                  {editable && !afterProjectEnd ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => addRow(day.iso)}
                      className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
                    >
                      <PlusIcon className="size-3.5" />
                      {t.timesheets.addTask}
                    </button>
                  ) : null}

                  {errors.days[day.iso] ? (
                    <p className="text-xs text-danger-600">
                      {errors.days[day.iso]}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
          <div className="space-y-1">
            <p className="text-sm text-ink-muted">
              {t.timesheets.totalHours}:{" "}
              <span className="text-lg font-semibold text-brand-600 tabular-nums">
                {formatMinutes(totalMinutes)}
              </span>
            </p>
            {editable && unsaved && !isSaving ? (
              <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span className="size-1.5 rounded-full bg-warn-700" />
                {t.timesheets.unsaved}
              </p>
            ) : null}
          </div>
          {editable ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                name="intent"
                value="draft"
                disabled={busy}
                onClick={guard("draft")}
                className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-60"
              >
                {isSaving ? t.timesheets.saving : t.timesheets.saveDraft}
              </button>
              <button
                type="submit"
                name="intent"
                value="submit"
                disabled={busy}
                onClick={guard("submit")}
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {isSaving ? t.timesheets.submitting : t.timesheets.submit}
              </button>
            </div>
          ) : null}
        </footer>
      </section>
    </form>
  );
}
