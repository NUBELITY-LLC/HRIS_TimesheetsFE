import Link from "next/link";

import { ApprovalProgress } from "@/components/dashboard/approval-progress";
import { TimesheetStatusBadge } from "@/components/dashboard/timesheet-status-badge";
import { getDictionary, getLocale } from "@/i18n/server";
import { decisionSummary } from "@/lib/timesheets/approvals";
import { formatMinutes } from "@/lib/timesheets/rules";
import type { Timesheet, TimesheetOwner } from "@/lib/timesheets/types";
import { formatWeekRange } from "@/lib/timesheets/week";
import { roleName } from "@/lib/users/roles";

export type SubmissionRow = Timesheet & { owner?: TimesheetOwner };

function rejectionOf(submission: SubmissionRow) {
  if (submission.status !== "REJECTED") return null;

  return (
    [...(submission.approvals ?? [])]
      .reverse()
      .find((step) => step.status === "REJECTED_TO_CONSULTANT") ?? null
  );
}

export type SubmissionsTableProps = {
  title: string;
  submissions: SubmissionRow[];
  action: "review" | "view";
  empty: { title: string; body: string; cta?: { href: string; label: string } };
  showOwner?: boolean;
  headerAction?: React.ReactNode;
  approvalIdByTimesheet?: ReadonlyMap<number, number>;
};

export async function SubmissionsTable({
  title,
  submissions,
  action,
  empty,
  showOwner = false,
  headerAction,
  approvalIdByTimesheet,
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
              {submissions.map((submission) => {
                const approvalId = approvalIdByTimesheet?.get(submission.id);
                const rejection = rejectionOf(submission);

                return (
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
                        {submission.company?.name ?? t.common.none}
                      </span>
                      <span className="block text-ink-muted">
                        {submission.client?.name ?? t.common.none} ·{" "}
                        {submission.project?.name ?? t.common.none}
                        {submission.assignmentCode
                          ? ` · ${submission.assignmentCode}`
                          : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-600 tabular-nums">
                      {formatMinutes(submission.totalMinutes)}
                    </td>
                    <td className="px-5 py-3.5">
                      <TimesheetStatusBadge status={submission.status} />
                      {rejection ? (
                        <p className="mt-1.5 max-w-56 text-xs text-danger-700">
                          <span className="font-medium">
                            {decisionSummary(rejection, t, locale)}
                          </span>
                          {rejection.comments
                            ? `: ${rejection.comments}`
                            : null}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5">
                      <ApprovalProgress
                        steps={submission.approvals ?? []}
                        currentSeq={submission.currentSeq}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {action === "review" ? (
                        approvalId ? (
                          <Link
                            href={`/reviews/${approvalId}`}
                            className="inline-flex rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                          >
                            {t.dashboard.review}
                          </Link>
                        ) : (
                          <span className="text-xs text-ink-muted">
                            {t.common.none}
                          </span>
                        )
                      ) : submission.status === "DRAFT" ||
                        submission.status === "REJECTED" ? (
                        <Link
                          href={`/timesheets/new?assignmentId=${submission.assignmentId}&weekStart=${submission.weekStart}`}
                          className={
                            submission.status === "REJECTED"
                              ? "inline-flex rounded-lg bg-danger-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-danger-700"
                              : "inline-flex rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                          }
                        >
                          {submission.status === "REJECTED"
                            ? t.dashboard.fix
                            : t.dashboard.resume}
                        </Link>
                      ) : (
                        <Link
                          href={`/history/${submission.id}`}
                          className="inline-flex rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                        >
                          {t.dashboard.view}
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
