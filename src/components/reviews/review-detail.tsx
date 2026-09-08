import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import { ApprovalProgress } from "@/components/dashboard/approval-progress";
import { TimesheetStatusBadge } from "@/components/dashboard/timesheet-status-badge";
import { DecisionPanel } from "@/components/reviews/decision-panel";
import { getDictionary, getLocale } from "@/i18n/server";
import { approvalStepLabel } from "@/lib/timesheets/approvals";
import { formatMinutes } from "@/lib/timesheets/rules";
import { currentApprovalStep, type TimesheetReview } from "@/lib/timesheets/types";
import {
  formatDayAndMonth,
  formatWeekRange,
  formatWeekday,
  fromISODate,
} from "@/lib/timesheets/week";
import { roleName } from "@/lib/users/roles";

export async function ReviewDetail({ review }: { review: TimesheetReview }) {
  const t = await getDictionary();
  const locale = await getLocale();

  const steps = review.approvals ?? [];
  const current = currentApprovalStep(steps, review.currentSeq);
  const currentIndex = current
    ? steps.findIndex((step) => step.seq === current.seq) + 1
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <Link
          href="/reviews"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {t.reviews.back}
        </Link>
        <p className="mt-2 text-sm text-ink-muted">
          {review.owner.fullName} · {review.client?.name ?? t.common.none}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.reviews.title} · {formatWeekRange(review.weekStart, locale)}
        </h1>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <div>
          <p className="text-sm text-ink-muted">{t.reviews.phaseTitle}</p>
          <p className="mt-1 text-base font-semibold text-brand-600">
            {current
              ? t.reviews.stageLine(currentIndex, approvalStepLabel(current, t))
              : t.reviews.noActiveStage}
          </p>
        </div>
        <ApprovalProgress steps={steps} currentSeq={review.currentSeq} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-3.5">
              <h2 className="text-sm font-semibold text-ink">
                {t.reviews.summaryTitle}
              </h2>
              <TimesheetStatusBadge status={review.status} />
            </div>
            <dl className="grid gap-5 p-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  {t.reviews.person}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {review.owner.fullName}
                </dd>
                <dd className="text-xs text-ink-muted">
                  {review.owner.jobTitle ?? roleName(review.owner.roleCode, t)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  {t.reviews.project}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {review.client?.name ?? t.common.none}
                </dd>
                <dd className="text-xs text-ink-muted">
                  {review.project?.name ?? t.common.none}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  {t.reviews.totalHours}
                </dt>
                <dd className="mt-1 text-xl font-semibold text-brand-600 tabular-nums">
                  {formatMinutes(review.totalMinutes)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
              {t.reviews.dailyTitle}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="px-5 py-3 font-semibold text-ink">
                      {t.reviews.columns.day}
                    </th>
                    <th className="px-5 py-3 font-semibold text-ink">
                      {t.reviews.columns.activity}
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-ink">
                      {t.reviews.columns.hours}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {review.days.map((day) => {
                    const date = fromISODate(day.date);

                    return (
                      <tr key={day.date} className="align-top">
                        <td className="px-5 py-3.5 font-medium whitespace-nowrap text-ink">
                          {date
                            ? `${formatWeekday(date, locale)} (${formatDayAndMonth(date, locale)})`
                            : day.date}
                        </td>
                        <td className="px-5 py-3.5 text-ink-soft">
                          {day.activities.length === 0 ? (
                            <span className="text-ink-muted">
                              {t.reviews.noActivity}
                            </span>
                          ) : (
                            <ul className="space-y-1">
                              {day.activities.map((activity) => (
                                <li key={activity.lineNo}>
                                  {activity.activity}
                                  <span className="ml-2 text-xs text-ink-muted tabular-nums">
                                    {formatMinutes(activity.minutes)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-ink tabular-nums">
                          {formatMinutes(day.minutes)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <DecisionPanel />
      </div>
    </div>
  );
}
