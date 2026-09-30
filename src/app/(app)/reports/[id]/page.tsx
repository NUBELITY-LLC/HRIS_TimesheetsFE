import type { Metadata } from "next";
import Link from "next/link";

import {
  SummaryCards,
  type SummaryCard,
} from "@/components/dashboard/summary-cards";
import { AlertIcon, ArrowLeftIcon } from "@/components/icons";
import { HoursReportTable } from "@/components/reports/hours-report";
import { PayoutPanel } from "@/components/reports/payout-panel";
import { ReportRangeFilters } from "@/components/reports/range-filters";
import { ExportLinks } from "@/components/timesheets/export-links";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  fetchHoursReport,
  fetchReportScopes,
  setScopeParams,
  type ReportRange,
  type ReportScope,
} from "@/lib/reports/queries";
import { monthToDate, normalizeRange } from "@/lib/reports/range";
import { parseScope } from "@/lib/reports/scope";
import { formatMinutes } from "@/lib/timesheets/rules";
import { formatDayAndMonth, fromISODate } from "@/lib/timesheets/week";
import { canViewHoursReports, roleName } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.reports.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseRange(
  params: Record<string, string | string[] | undefined>,
): ReportRange {
  const fallback = monthToDate();

  return normalizeRange(
    firstParam(params.from) || fallback.from,
    firstParam(params.to) || fallback.to,
  );
}

function backHref(scope: ReportScope): string {
  const query = setScopeParams(new URLSearchParams(), scope).toString();
  return query ? `/reports?${query}` : "/reports";
}

async function Notice({ title, body }: { title: string; body: string }) {
  const t = await getDictionary();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
        <div>
          <h1 className="text-sm font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{body}</p>
          <Link
            href="/reports"
            className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ArrowLeftIcon className="size-4" />
            {t.reports.detail.back}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function ReportDetailPage({
  params,
  searchParams,
}: PageProps<"/reports/[id]">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();
  const d = t.reports.detail;

  if (!canViewHoursReports(actor)) {
    return (
      <Notice title={t.reports.noAccessTitle} body={t.reports.noAccessBody} />
    );
  }

  const { id } = await params;
  const personId = Number(id);

  if (!Number.isInteger(personId) || personId <= 0) {
    return <Notice title={d.notFoundTitle} body={d.notFoundBody} />;
  }

  const query = await searchParams;
  const range = parseRange(query);
  const scopes = await fetchReportScopes();
  const scope = parseScope(query, scopes);
  const back = backHref(scope);
  const result = await fetchHoursReport(personId, range, scope);

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Link
          href={back}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {d.back}
        </Link>
        <ReportRangeFilters
          personId={personId}
          range={range}
          scopes={scopes}
          scope={scope}
        />
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger-600" />
          <div>
            <p className="text-sm font-semibold text-danger-700">
              {t.reports.loadErrorTitle}
            </p>
            <p className="mt-1 text-sm text-danger-700">{result.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const { report } = result;
  const fromDate = fromISODate(report.from);
  const toDate = fromISODate(report.to);
  const averageMinutes = report.workedDays
    ? Math.round(report.totalMinutes / report.workedDays)
    : 0;

  const cards: SummaryCard[] = [
    {
      key: "total",
      label: d.totalHours,
      value: formatMinutes(report.totalMinutes),
      hint: d.totalHoursHint(
        fromDate ? formatDayAndMonth(fromDate, locale) : report.from,
        toDate ? formatDayAndMonth(toDate, locale) : report.to,
      ),
      icon: "hours",
      tone: "brand",
    },
    {
      key: "days",
      label: d.workedDays,
      value: String(report.workedDays),
      hint: d.workedDaysHint(report.rangeDays),
      icon: "approved",
      tone: "success",
    },
    {
      key: "average",
      label: d.average,
      value: formatMinutes(averageMinutes),
      hint: d.averageHint,
      icon: "hours",
      tone: "warn",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <Link
          href={back}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {d.back}
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-ink-muted">{d.eyebrow}</p>
          <ExportLinks
            basePath={`/reports/${personId}/export`}
            query={setScopeParams(
              new URLSearchParams({ from: report.from, to: report.to }),
              scope,
            ).toString()}
          />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {report.person.fullName}
          </h1>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-soft">
            {roleName(report.person.roleCode, t)}
          </span>
          <span className="text-sm text-ink-muted">
            {report.person.jobTitle ?? t.common.none}
          </span>
        </div>
      </div>

      <ReportRangeFilters
        personId={personId}
        range={range}
        scopes={scopes}
        scope={scope}
      />

      <SummaryCards cards={cards} />

      <PayoutPanel report={report} />

      <HoursReportTable report={report} />
    </div>
  );
}
