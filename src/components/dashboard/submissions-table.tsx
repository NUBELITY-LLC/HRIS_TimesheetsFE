import Link from "next/link";

import { ApprovalProgress } from "@/components/dashboard/approval-progress";
import { TimesheetStatusBadge } from "@/components/dashboard/timesheet-status-badge";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatMinutes } from "@/lib/timesheets/rules";
import type { Timesheet, TimesheetOwner } from "@/lib/timesheets/types";
import { formatWeekRange } from "@/lib/timesheets/week";
import { roleName } from "@/lib/users/roles";

export type SubmissionRow = Timesheet & { owner?: TimesheetOwner };

export type SubmissionsTableProps = {
  title: string;
  submissions: SubmissionRow[];
  action: "review" | "soon";
  empty: { title: string; body: string; cta?: { href: string; label: string } };
  showOwner?: boolean;
  headerAction?: React.ReactNode;
};

export async function SubmissionsTable({
  title,
  submissions,
  action,
  empty,
  showOwner = false,
  headerAction,
}: SubmissionsTableProps) {
  const t = await getDictionary();
  const locale = await getLocale();

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {headerAction}
      </header>

      {submissions.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-ink">{empty.title}</p>
          <p className="mt-1 text-sm text-ink-muted">{empty.body}</p>
          {empty.cta ? (
            <Link
              href={empty.cta.href}
              className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {empty.cta.label}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {showOwner ? (
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.dashboard.columns.owner}
                  </th>
                ) : null}
                <th className="px-5 py-3 font-semibold text-ink">
                  {t.dashboard.columns.range}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {t.dashboard.columns.project}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {t.dashboard.columns.hours}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {t.dashboard.columns.status}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {t.dashboard.columns.progress}
                </th>
                <th className="px-5 py-3 text-right font-semibold text-ink">
                  {t.dashboard.columns.action}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {submissions.map((submission) => (
                <tr key={submission.id} className="align-middle">
                  {showOwner ? (
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-ink">
                        {submission.owner?.fullName ?? t.common.unknown}
                      </span>
                      <span className="block text-ink-muted">
                        {submission.owner
                          ? roleName(submission.owner.roleCode, t)
                          : t.common.none}
                      </span>
                    </td>
                  ) : null}
                  <td className="px-5 py-3.5 font-medium whitespace-nowrap text-ink">
                    {formatWeekRange(submission.weekStart, locale)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="block font-medium text-ink">
                      {submission.client?.name ?? t.common.none}
                    </span>
                    <span className="block text-ink-muted">
                      {submission.project?.name ?? t.common.none}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-brand-600 tabular-nums">
                    {formatMinutes(submission.totalMinutes)}
                  </td>
                  <td className="px-5 py-3.5">
                    <TimesheetStatusBadge status={submission.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <ApprovalProgress
                      steps={submission.approvals ?? []}
                      currentSeq={submission.currentSeq}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {action === "review" ? (
                      <Link
                        href={`/reviews/${submission.id}`}
                        className="inline-flex rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                      >
                        {t.dashboard.review}
                      </Link>
                    ) : (
                      <Link
                        href={`/timesheets?assignmentId=${submission.assignmentId}&weekStart=${submission.weekStart}`}
                        className="inline-flex rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                      >
                        {t.dashboard.view}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
