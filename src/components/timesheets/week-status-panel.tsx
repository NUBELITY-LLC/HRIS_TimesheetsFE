import { ApprovalProgress } from "@/components/dashboard/approval-progress";
import { TimesheetStatusBadge } from "@/components/dashboard/timesheet-status-badge";
import { getDictionary } from "@/i18n/server";
import type { Timesheet } from "@/lib/timesheets/types";

export async function WeekStatusPanel({ timesheet }: { timesheet: Timesheet }) {
  const t = await getDictionary();

  return (
    <section className="space-y-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-ink-muted">{t.timesheets.weekStatus}</span>
          <TimesheetStatusBadge status={timesheet.status} />
          {timesheet.submissionCode ? (
            <span className="text-xs text-ink-muted">
              {t.timesheets.submissionCode(timesheet.submissionCode)}
            </span>
          ) : null}
        </div>
        {timesheet.approvals?.length ? (
          <ApprovalProgress
            steps={timesheet.approvals}
            currentSeq={timesheet.currentSeq}
          />
        ) : null}
      </div>

      {timesheet.editable ? null : (
        <p className="text-xs text-ink-muted">{t.timesheets.lockedTitle}</p>
      )}
    </section>
  );
}
