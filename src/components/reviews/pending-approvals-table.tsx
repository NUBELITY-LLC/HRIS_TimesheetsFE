import { Fragment } from "react";
import Link from "next/link";

import { ChevronRightIcon, MailIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/server";
import { groupByConsultant } from "@/lib/approvals/grouping";
import type { PendingApproval } from "@/lib/approvals/types";
import { getCurrentUser } from "@/lib/auth/session";
import { formatMoney } from "@/lib/format/money";
import { canSeeCosts } from "@/lib/users/roles";
import {
  approvalStepLabel,
  isExternalApprover,
} from "@/lib/timesheets/approvals";
import { formatMinutes } from "@/lib/timesheets/rules";
import { formatWeekRange } from "@/lib/timesheets/week";
import {
  formatHourlyRates,
  formatRateRange,
  hourlyRatesOf,
} from "@/lib/payroll/rate-spans";

export async function PendingApprovalsTable({
  title,
  approvals,
  empty,
}: {
  title: string;
  approvals: PendingApproval[];
  empty: { title: string; body: string };
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const groups = groupByConsultant(approvals);
  const user = await getCurrentUser();
  const showCosts = user ? canSeeCosts(user) : false;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <p className="text-xs text-ink-muted">
          {t.reviews.taskCount(approvals.length)}
        </p>
      </header>

      {approvals.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-ink">{empty.title}</p>
          <p className="mt-1 text-sm text-ink-muted">{empty.body}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-semibold text-ink">
                  {t.reviews.groupColumns.consultant}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {t.reviews.groupColumns.clientProject}
                </th>
                <th className="px-5 py-3 text-right font-semibold text-ink">
                  {t.reviews.groupColumns.hours}
                </th>
                {showCosts ? (
                  <>
                    <th className="px-5 py-3 text-right font-semibold text-ink">
                      {t.reviews.groupColumns.hourCost}
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-ink">
                      {t.reviews.groupColumns.totalCost}
                    </th>
                  </>
                ) : null}
                <th className="px-5 py-3 font-semibold text-ink">
                  {t.reviews.groupColumns.step}
                </th>
                <th className="px-5 py-3">
                  <span className="sr-only">
                    {t.reviews.groupColumns.action}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <Fragment key={group.consultantId}>
                  <tr className="border-t-4 border-t-surface-muted bg-surface-muted/60">
                    <td className="px-5 py-3 font-semibold text-ink">
                      {group.consultantName}
                      <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                        {t.reviews.groupTaskCount(group.approvals.length)}
                      </span>
                    </td>
                    <td className="px-5 py-3" />
                    <td className="px-5 py-3 text-right font-semibold text-ink tabular-nums">
                      {formatMinutes(group.totalMinutes)}
                    </td>
                    {showCosts ? (
                      <>
                        <td className="px-5 py-3 text-right font-medium text-ink-muted tabular-nums">
                          {formatRateRange(
                            group.hourlyRates,
                            group.currency,
                            locale,
                          )}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-ink tabular-nums">
                          {formatMoney(
                            group.totalAmount,
                            group.currency,
                            locale,
                          )}
                        </td>
                      </>
                    ) : null}
                    <td className="px-5 py-3" />
                    <td className="px-5 py-3" />
                  </tr>

                  {group.approvals.map((approval) => (
                    <tr
                      key={approval.approvalId}
                      className="border-t border-line/60 transition-colors hover:bg-surface-muted/40"
                    >
                      <td className="px-5 py-3" />
                      <td className="px-5 py-3">
                        <Link
                          href={`/reviews/${approval.approvalId}`}
                          className="block font-medium text-brand-600 hover:text-brand-700"
                        >
                          {approval.company?.name ?? t.common.none}
                        </Link>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {approval.client.name} / {approval.project.name}
                          {approval.assignmentCode
                            ? ` · ${approval.assignmentCode}`
                            : ""}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {formatWeekRange(approval.weekStart, locale)} ·{" "}
                          {approval.submissionCode ?? t.common.none}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-ink tabular-nums">
                        {formatMinutes(approval.totalMinutes)}
                      </td>
                      {showCosts ? (
                        <>
                          <td className="px-5 py-3 text-right text-ink-muted tabular-nums">
                            {formatHourlyRates(
                              hourlyRatesOf(approval.pay, approval.hourlyRate),
                              approval.currency,
                              locale,
                            )}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-ink tabular-nums">
                            {formatMoney(
                              approval.amount,
                              approval.currency,
                              locale,
                            )}
                          </td>
                        </>
                      ) : null}
                      <td className="px-5 py-3">
                        <span className="block text-xs font-medium text-ink">
                          {t.approvals.step(approval.seq)} ·{" "}
                          {approvalStepLabel(approval, t)}
                        </span>
                        {isExternalApprover(approval.approverType) ? (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-warn-50 px-2 py-0.5 text-[11px] font-medium text-warn-700">
                            <MailIcon className="size-3" />
                            {t.approvals.external.badge}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/reviews/${approval.approvalId}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted"
                        >
                          {t.reviews.review}
                          <ChevronRightIcon className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
