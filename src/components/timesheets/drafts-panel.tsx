"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SpinnerIcon, TrashIcon } from "@/components/icons";
import { useDictionary, useLocale } from "@/i18n/provider";
import { discardDraftAction } from "@/lib/timesheets/actions";
import { INITIAL_DRAFT_ACTION_STATE } from "@/lib/timesheets/form-state";
import { formatMinutes } from "@/lib/timesheets/rules";
import type { Timesheet } from "@/lib/timesheets/types";
import { formatWeekRange } from "@/lib/timesheets/week";

function DiscardDraft({
  timesheetId,
  weekLabel,
}: {
  timesheetId: number;
  weekLabel: string;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    discardDraftAction,
    INITIAL_DRAFT_ACTION_STATE,
  );

  return (
    <form
      action={formAction}
      className="relative"
      onSubmit={(event) => {
        if (!window.confirm(t.timesheets.drafts.confirm(weekLabel))) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="timesheetId" value={timesheetId} />
      <button
        type="submit"
        disabled={isPending}
        title={t.timesheets.drafts.discard}
        aria-label={t.timesheets.drafts.discard}
        className="grid size-9 place-items-center rounded-md text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
      >
        {isPending ? (
          <SpinnerIcon className="size-4 animate-spin" />
        ) : (
          <TrashIcon className="size-4" />
        )}
      </button>
      {state.status === "error" && state.message ? (
        <p className="absolute top-full right-0 mt-1 text-xs whitespace-nowrap text-danger-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function DraftsPanel({
  drafts,
  currentAssignmentId,
  currentWeekStart,
  companyId,
}: {
  drafts: Timesheet[];
  currentAssignmentId: number;
  currentWeekStart: string;
  companyId: string;
}) {
  const t = useDictionary();
  const locale = useLocale();

  if (drafts.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-muted px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">
          {t.timesheets.drafts.title}
        </h2>
        <p className="text-xs text-ink-muted">
          {t.timesheets.drafts.count(drafts.length)}
        </p>
      </header>

      <ul className="divide-y divide-line">
        {drafts.map((draft) => {
          const weekLabel = formatWeekRange(draft.weekStart, locale);
          const isCurrent =
            draft.assignmentId === currentAssignmentId &&
            draft.weekStart === currentWeekStart;
          const query = new URLSearchParams({
            assignmentId: String(draft.assignmentId),
            weekStart: draft.weekStart,
          });
          if (companyId) query.set("company", companyId);

          return (
            <li
              key={draft.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                  <span className="truncate">{weekLabel}</span>
                  {draft.status === "REJECTED" ? (
                    <span className="rounded-full bg-danger-50 px-2 py-0.5 text-xs font-medium text-danger-700">
                      {t.timesheetStatus.REJECTED}
                    </span>
                  ) : null}
                  {isCurrent ? (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {t.timesheets.drafts.current}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {draft.project?.name ?? t.common.unknown}
                  {draft.client ? ` · ${draft.client.name}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink tabular-nums">
                  {formatMinutes(draft.totalMinutes)}
                </span>
                {isCurrent ? null : (
                  <Link
                    href={`/timesheets?${query.toString()}`}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                  >
                    {t.timesheets.drafts.open}
                  </Link>
                )}
                {draft.status === "DRAFT" ? (
                  <DiscardDraft timesheetId={draft.id} weekLabel={weekLabel} />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
