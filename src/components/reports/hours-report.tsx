import { Fragment } from "react";

import { TimesheetStatusBadge } from "@/components/dashboard/timesheet-status-badge";
import { getDictionary, getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import { formatMoney, formatRate } from "@/lib/format/money";
import { formatMinutes } from "@/lib/timesheets/rules";
import {
  formatDayAndMonth,
  formatWeekday,
  fromISODate,
} from "@/lib/timesheets/week";
import type { HoursReport, ReportDay } from "@/lib/reports/types";

import {
  ActivityBreakdownSwitch,
  DayBreakdownRows,
} from "./activity-breakdown";

function dayLabel(isoDate: string, locale: Locale): string {
  const date = fromISODate(isoDate);
  if (!date) return isoDate;

  return `${formatWeekday(date, locale)} ${formatDayAndMonth(date, locale)}`;
}

function ActivityRows({
  day,
  noneLabel,
  emptyLabel,
}: {
  day: ReportDay;
  noneLabel: string;
  emptyLabel: string;
}) {
  const grouped = day.entries.length > 1;

  return day.entries.map((entry) => {
    const activities = entry.activities ?? [];
    const key = `${day.date}-${entry.timesheetId}`;

    const header = grouped ? (
      <tr key={`${key}-group`} className="bg-surface-muted/50 text-xs">
        <td />
        <td colSpan={2} className="px-5 pt-3 pb-1.5">
          <span className="font-semibold text-ink">
            {entry.company?.name ?? noneLabel}
          </span>
          <span className="text-ink-muted">
            {" · "}
            {entry.project?.name ?? noneLabel}
          </span>
        </td>
        <td className="px-5 pt-3 pb-1.5 text-ink-muted">
          {entry.submissionCode ?? noneLabel}
        </td>
        <td className="px-5 pt-3 pb-1.5 text-right font-semibold text-ink-soft tabular-nums">
          {formatMinutes(entry.minutes)}
        </td>
        <td colSpan={2} />
      </tr>
    ) : null;

    const rows =
      activities.length === 0
        ? [
            <tr key={`${key}-empty`} className="bg-surface-muted/50">
              <td />
              <td
                colSpan={6}
                className={`px-5 py-2 text-xs text-ink-muted ${grouped ? "pl-9" : ""}`}
              >
                {emptyLabel}
              </td>
            </tr>,
          ]
        : activities.map((activity) => (
            <tr
              key={`${key}-${activity.lineNo}`}
              className="bg-surface-muted/50 text-xs"
            >
              <td />
              <td
                colSpan={3}
                className={`px-5 py-2 text-ink-soft ${grouped ? "pl-9" : ""}`}
              >
                <span className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-muted"
                  />
                  <span className="whitespace-pre-line">
                    {activity.activity}
                  </span>
                </span>
              </td>
              <td className="px-5 py-2 text-right text-ink-soft tabular-nums">
                {formatMinutes(activity.minutes)}
              </td>
              <td colSpan={2} />
            </tr>
          ));

    return header ? [header, ...rows] : rows;
  });
}

export async function HoursReportTable({ report }: { report: HoursReport }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const d = t.reports.detail;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-surface-muted px-5 py-3">
        <h2 className="text-sm font-semibold text-ink">{d.dailyTitle}</h2>
        {report.days.length > 0 ? (
          <ActivityBreakdownSwitch label={d.showActivities} />
        ) : null}
      </header>

      {report.days.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-ink">{d.emptyTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{d.emptyBody}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-semibold text-ink">
                  {d.columns.day}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {d.columns.project}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {d.columns.submission}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {d.columns.status}
                </th>
                <th className="px-5 py-3 text-right font-semibold text-ink">
                  {d.columns.hours}
                </th>
                <th className="px-5 py-3 text-right font-semibold text-ink">
                  {d.columns.hourCost}
                </th>
                <th className="px-5 py-3 text-right font-semibold text-ink">
                  {d.columns.amount}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {report.days.map((day) => (
                <Fragment key={day.date}>
                  <tr className="align-top">
                    <td className="px-5 py-3.5 font-medium whitespace-nowrap text-ink">
                      {dayLabel(day.date, locale)}
                    </td>
                    <td className="px-5 py-3.5">
                      <ul className="space-y-1">
                        {day.entries.map((entry) => (
                          <li key={`${entry.timesheetId}-${entry.minutes}`}>
                            <span className="block font-medium text-ink">
                              {entry.company?.name ?? t.common.none}
                            </span>
                            <span className="block text-ink-muted">
                              {entry.client?.name ?? t.common.none} ·{" "}
                              {entry.project?.name ?? t.common.none}
                              {entry.assignmentCode
                                ? ` · ${entry.assignmentCode}`
                                : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3.5">
                      <ul className="space-y-1">
                        {day.entries.map((entry) => (
                          <li
                            key={entry.timesheetId}
                            className="text-ink-muted"
                          >
                            {entry.submissionCode ?? t.common.none}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3.5">
                      <ul className="space-y-1">
                        {day.entries.map((entry) => (
                          <li key={entry.timesheetId}>
                            <TimesheetStatusBadge status={entry.status} />
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-brand-600 tabular-nums">
                      {formatMinutes(day.minutes)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-ink-muted tabular-nums">
                      <ul className="space-y-1">
                        {day.entries.map((entry) => (
                          <li key={entry.timesheetId}>
                            {formatRate(
                              entry.hourlyRate,
                              entry.currency,
                              locale,
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-ink tabular-nums">
                      <ul className="space-y-1">
                        {day.entries.map((entry) => (
                          <li key={entry.timesheetId}>
                            {formatMoney(entry.amount, entry.currency, locale)}
                            {entry.lines
                              .filter((line) => line.bucket !== "REGULAR")
                              .map((line) => (
                                <span
                                  key={`${line.bucket}-${line.multiplier}`}
                                  className="block text-xs font-normal text-ink-muted"
                                >
                                  {t.payTerms.buckets[line.bucket]}{" "}
                                  {formatMinutes(line.minutes)} ×
                                  {line.multiplier}
                                </span>
                              ))}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <DayBreakdownRows>
                    <ActivityRows
                      day={day}
                      noneLabel={t.common.none}
                      emptyLabel={d.noActivities}
                    />
                  </DayBreakdownRows>
                </Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line bg-surface-muted">
                <td
                  colSpan={4}
                  className="px-5 py-3 text-right text-sm font-semibold text-ink"
                >
                  {d.total}
                </td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-brand-600 tabular-nums">
                  {formatMinutes(report.totalMinutes)}
                </td>
                <td className="px-5 py-3" />
                <td className="px-5 py-3 text-right text-sm font-semibold text-ink tabular-nums">
                  <ul className="space-y-1">
                    {report.totals.map((total) => (
                      <li key={total.currency}>
                        {formatMoney(total.amount, total.currency, locale)}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
