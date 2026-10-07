import Link from "next/link";

import { ChevronRightIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { intlLocale } from "@/lib/format/datetime";
import { formatMoney, formatRate } from "@/lib/format/money";
import { formatRateRange } from "@/lib/payroll/rate-spans";
import {
  PERIOD_GROUPS,
  periodsInRange,
  type PeriodGroup,
} from "@/lib/reports/range";
import type {
  CompanyReport,
  CompanyReportPerson,
  ReportTotal,
} from "@/lib/reports/types";
import { formatMinutes } from "@/lib/timesheets/rules";

function Amounts({
  totals,
  locale,
  fallback,
}: {
  totals: ReportTotal[];
  locale: Locale;
  fallback: string;
}) {
  if (!totals.length) return <>{fallback}</>;

  return (
    <>
      {totals.map((total) => (
        <span key={total.currency} className="block">
          {formatMoney(total.amount, total.currency, locale)}
        </span>
      ))}
    </>
  );
}

function personRate(person: CompanyReportPerson, locale: Locale): string {
  const currency = person.totals[0]?.currency ?? null;

  return person.hourlyRates.length > 1
    ? formatRateRange(person.hourlyRates, currency, locale)
    : formatRate(person.hourlyRates[0] ?? null, currency, locale);
}

export async function CompanyReportSummary({
  report,
}: {
  report: CompanyReport;
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.reports.company;
  const d = t.reports.detail;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-navy-900 text-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-6 px-6 py-5">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            {c.workedHours}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {formatMinutes(report.totalMinutes)}
          </p>
        </div>

        <dl className="flex flex-wrap gap-8">
          <div>
            <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              {c.amount}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              <Amounts
                totals={report.totals}
                locale={locale}
                fallback={t.common.none}
              />
            </dd>
            {report.totals.length > 1 ? (
              <dd className="mt-1 text-xs text-slate-400">
                {d.mixedCurrencies}
              </dd>
            ) : null}
          </div>
          {[
            [c.projects, String(report.projectCount)],
            [c.people, String(report.peopleCount)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                {label}
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const CELL = "px-5 py-3";
const HEAD = "px-5 py-3 font-semibold text-ink";
const OPEN_LINK =
  "inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted";

function personHref(
  report: CompanyReport,
  person: CompanyReportPerson,
  projectId?: number,
): string {
  const params = new URLSearchParams({
    from: report.from,
    to: report.to,
    companyId: String(report.company.id),
  });
  if (projectId) params.set("projectId", String(projectId));

  return `/reports/${person.id}?${params.toString()}`;
}

async function PeopleTable({
  report,
  people,
  projectId,
}: {
  report: CompanyReport;
  people: CompanyReportPerson[];
  projectId?: number;
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.reports.company;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-3xl border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            <th className={HEAD}>{c.columns.person}</th>
            <th className={`${HEAD} text-right`}>{c.columns.days}</th>
            <th className={`${HEAD} text-right`}>{c.columns.hours}</th>
            <th className={`${HEAD} text-right`}>{c.columns.hourCost}</th>
            <th className={`${HEAD} text-right`}>{c.columns.amount}</th>
            <th className={`${HEAD} text-right`}>{c.columns.action}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {people.map((person) => (
            <tr key={person.id} className="align-middle">
              <td className={CELL}>
                <span className="block font-medium text-ink">
                  {person.fullName}
                </span>
                <span className="block text-ink-muted">
                  {person.jobTitle ?? t.common.none}
                </span>
              </td>
              <td className={`${CELL} text-right text-ink-soft tabular-nums`}>
                {person.workedDays}
              </td>
              <td
                className={`${CELL} text-right font-semibold text-brand-600 tabular-nums`}
              >
                {formatMinutes(person.minutes)}
              </td>
              <td className={`${CELL} text-right text-ink-muted tabular-nums`}>
                {personRate(person, locale)}
              </td>
              <td
                className={`${CELL} text-right font-medium text-ink tabular-nums`}
              >
                <Amounts
                  totals={person.totals}
                  locale={locale}
                  fallback={t.common.none}
                />
              </td>
              <td className={`${CELL} text-right`}>
                <Link
                  href={personHref(report, person, projectId)}
                  className={OPEN_LINK}
                >
                  {c.open}
                  <ChevronRightIcon className="size-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function periodLabel(
  from: string,
  to: string,
  group: PeriodGroup,
  locale: Locale,
): string {
  const date = new Date(`${from}T00:00:00.000Z`);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intlLocale(locale), {
      ...options,
      timeZone: "UTC",
    }).format(date);

  if (group === "year") return from.slice(0, 4);
  if (group === "month") {
    const label = format({ month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  const month = format({ month: "short" }).replace(".", "");
  return `${Number(from.slice(8, 10))}–${Number(to.slice(8, 10))} ${month} ${from.slice(0, 4)}`;
}

function sumPeriod(report: CompanyReport, from: string, to: string) {
  const totals = new Map<string, number>();
  let minutes = 0;

  for (const day of report.days) {
    if (day.date < from || day.date > to) continue;
    minutes += day.minutes;
    for (const total of day.totals) {
      totals.set(
        total.currency,
        (totals.get(total.currency) ?? 0) + total.amount,
      );
    }
  }

  return {
    minutes,
    totals: [...totals.entries()].map(([currency, amount]) => ({
      currency,
      amount: Math.round(amount * 100) / 100,
    })),
  };
}

export async function CompanyReportPeriods({
  report,
  group,
  groupHref,
}: {
  report: CompanyReport;
  group: PeriodGroup;
  groupHref: Record<PeriodGroup, string>;
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.reports.company;
  const periods = periodsInRange(report.from, report.to, group).map(
    (period) => {
      const from = period.from < report.from ? report.from : period.from;
      const to = period.to > report.to ? report.to : period.to;
      return { from, to, ...sumPeriod(report, from, to) };
    },
  );

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-3">
        <h2 className="text-sm font-semibold text-ink">{c.periodTitle}</h2>
        <nav
          className="flex gap-1 rounded-lg bg-surface p-1 shadow-sm"
          aria-label={c.groupLabel}
        >
          {PERIOD_GROUPS.map((key) => (
            <Link
              key={key}
              href={groupHref[key]}
              aria-current={group === key ? "page" : undefined}
              scroll={false}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                group === key
                  ? "bg-brand-600 text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {c.groups[key]}
            </Link>
          ))}
        </nav>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-md border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className={HEAD}>{c.columns.period}</th>
              <th className={`${HEAD} text-right`}>{c.columns.hours}</th>
              <th className={`${HEAD} text-right`}>{c.columns.amount}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {periods.map((period) => (
              <tr key={period.from}>
                <td className={`${CELL} font-medium text-ink`}>
                  {periodLabel(period.from, period.to, group, locale)}
                </td>
                <td
                  className={`${CELL} text-right font-semibold tabular-nums ${
                    period.minutes ? "text-brand-600" : "text-ink-muted"
                  }`}
                >
                  {formatMinutes(period.minutes)}
                </td>
                <td className={`${CELL} text-right text-ink tabular-nums`}>
                  <Amounts
                    totals={period.totals}
                    locale={locale}
                    fallback={t.common.none}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line bg-surface-muted">
              <td className={`${CELL} font-semibold text-ink`}>{c.total}</td>
              <td
                className={`${CELL} text-right font-semibold text-brand-600 tabular-nums`}
              >
                {formatMinutes(report.totalMinutes)}
              </td>
              <td
                className={`${CELL} text-right font-semibold text-ink tabular-nums`}
              >
                <Amounts
                  totals={report.totals}
                  locale={locale}
                  fallback={t.common.none}
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export async function CompanyReportProjects({
  report,
}: {
  report: CompanyReport;
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.reports.company;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="border-b border-line bg-surface-muted px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">{c.projectsTitle}</h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-xl border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className={HEAD}>{c.columns.project}</th>
              <th className={HEAD}>{c.columns.client}</th>
              <th className={`${HEAD} text-right`}>{c.columns.hours}</th>
              <th className={`${HEAD} text-right`}>{c.columns.amount}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {report.projects.map((project) => (
              <tr key={project.id} className="align-middle">
                <td className={CELL}>
                  <span className="flex flex-wrap items-center gap-2 font-medium text-ink">
                    {project.name}
                    {project.isClosed ? (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted">
                        {c.closed}
                      </span>
                    ) : null}
                  </span>
                  {project.code ? (
                    <span className="block text-ink-muted">{project.code}</span>
                  ) : null}
                </td>
                <td className={`${CELL} text-ink-soft`}>
                  {project.clientName || t.common.none}
                </td>
                <td
                  className={`${CELL} text-right font-semibold text-brand-600 tabular-nums`}
                >
                  {formatMinutes(project.minutes)}
                </td>
                <td
                  className={`${CELL} text-right font-medium text-ink tabular-nums`}
                >
                  <Amounts
                    totals={project.totals}
                    locale={locale}
                    fallback={t.common.none}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export async function CompanyReportPeople({
  report,
  projectId,
}: {
  report: CompanyReport;
  projectId?: number;
}) {
  const t = await getDictionary();
  const c = t.reports.company;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="border-b border-line bg-surface-muted px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">{c.peopleTitle}</h2>
      </header>
      <PeopleTable
        report={report}
        people={report.people}
        projectId={projectId}
      />
    </section>
  );
}
