import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, ArrowLeftIcon } from "@/components/icons";
import { ApprovalProgress } from "@/components/dashboard/approval-progress";
import { TimesheetStatusBadge } from "@/components/dashboard/timesheet-status-badge";
import { getDictionary, getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format/datetime";
import { fetchMyTimesheet } from "@/lib/timesheets/queries";
import { formatMinutes } from "@/lib/timesheets/rules";
import {
  formatDayAndMonth,
  formatWeekRange,
  formatWeekday,
  fromISODate,
} from "@/lib/timesheets/week";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.history.detail.title };
}

function dayLabel(isoDate: string, locale: Locale): string {
  const date = fromISODate(isoDate);
  if (!date) return isoDate;

  return `${formatWeekday(date, locale)} ${formatDayAndMonth(date, locale)}`;
}

async function NotFound() {
  const t = await getDictionary();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
        <div>
          <h1 className="text-sm font-semibold text-ink">
            {t.history.detail.notFoundTitle}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {t.history.detail.notFoundBody}
          </p>
          <Link
            href="/history"
            className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ArrowLeftIcon className="size-4" />
            {t.history.detail.back}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function HistoryDetailPage({
  params,
}: PageProps<"/history/[id]">) {
  await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();

  const { id } = await params;
  const timesheetId = Number(id);

  if (!Number.isInteger(timesheetId) || timesheetId <= 0) return <NotFound />;

  const timesheet = await fetchMyTimesheet(timesheetId);

  if (!timesheet) return <NotFound />;

  const days = timesheet.days ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <Link
          href="/history"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {t.history.detail.back}
        </Link>
        <p className="mt-3 text-sm text-ink-muted">
          {t.history.detail.eyebrow}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {formatWeekRange(timesheet.weekStart, locale)}
          </h1>
          <TimesheetStatusBadge status={timesheet.status} />
          <span className="text-sm text-ink-muted">
            {timesheet.submissionCode ?? t.common.none}
          </span>
        </div>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
              {t.history.detail.project}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink">
              {timesheet.company?.name ?? t.common.none}
              <span className="block text-xs font-normal text-ink-muted">
                {timesheet.client?.name ?? t.common.none} ·{" "}
                {timesheet.project?.name ?? t.common.none}
                {timesheet.assignmentCode
                  ? ` · ${timesheet.assignmentCode}`
                  : ""}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
              {t.history.detail.hours}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-brand-600 tabular-nums">
              {formatMinutes(timesheet.totalMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
              {t.history.detail.submitted}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink">
              {formatDateTime(timesheet.submittedAt, locale, {
                empty: t.common.none,
                invalid: t.common.unknown,
              })}
            </dd>
          </div>
        </dl>

        {timesheet.approvals && timesheet.approvals.length > 0 ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
              {t.history.detail.progress}
            </p>
            <div className="mt-2">
              <ApprovalProgress
                steps={timesheet.approvals}
                currentSeq={timesheet.currentSeq}
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.history.detail.dailyTitle}
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
              {days.map((day) => (
                <tr key={day.date} className="align-top">
                  <td className="px-5 py-3 font-medium whitespace-nowrap text-ink">
                    {dayLabel(day.date, locale)}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {day.activities.length === 0 ? (
                      <span className="text-ink-muted">
                        {t.reviews.noActivity}
                      </span>
                    ) : (
                      <ul className="space-y-1">
                        {day.activities.map((activity) => (
                          <li key={activity.lineNo} className="flex gap-2">
                            <span className="text-ink-muted tabular-nums">
                              {formatMinutes(activity.minutes)}
                            </span>
                            <span>{activity.activity}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {day.note ? (
                      <p className="mt-1 text-xs text-ink-muted">{day.note}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-ink tabular-nums">
                    {formatMinutes(day.minutes)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line bg-surface-muted">
                <td
                  colSpan={2}
                  className="px-5 py-3 text-right text-sm font-semibold text-ink"
                >
                  {t.reviews.totalHours}
                </td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-brand-600 tabular-nums">
                  {formatMinutes(timesheet.totalMinutes)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
