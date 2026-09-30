import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, ArrowLeftIcon } from "@/components/icons";
import { CompanyRangeFilters } from "@/components/reports/company-filters";
import {
  CompanyReportPeople,
  CompanyReportPeriods,
  CompanyReportProjects,
  CompanyReportSummary,
} from "@/components/reports/company-report";
import { ExportLinks } from "@/components/timesheets/export-links";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  fetchCompanyReport,
  fetchReportScopes,
  type ReportRange,
} from "@/lib/reports/queries";
import {
  DEFAULT_PERIOD_GROUP,
  PERIOD_GROUPS,
  normalizeRange,
  parsePeriodGroup,
  presetRange,
  type PeriodGroup,
} from "@/lib/reports/range";
import {
  EMPTY_COMPANY_FILTERS,
  setCompanyFilterParams,
  parseCompanyFilters,
} from "@/lib/reports/scope";
import type { CompanyFilterOptions, CompanyFilters } from "@/lib/reports/types";
import { canViewHoursReports } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.reports.company.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseRange(
  params: Record<string, string | string[] | undefined>,
): ReportRange {
  const fallback = presetRange("quarter");

  return normalizeRange(
    firstParam(params.from) || fallback.from,
    firstParam(params.to) || fallback.to,
  );
}

function keepKnownFilters(
  filters: CompanyFilters,
  options: CompanyFilterOptions,
): CompanyFilters {
  const known = (ids: number[], value: string | null) =>
    value === null || value === "" || ids.includes(Number(value)) ? value : "";

  return {
    ...EMPTY_COMPANY_FILTERS,
    projectId: known(
      options.projects.map((project) => project.id),
      filters.projectId,
    ),
    userId: known(
      options.people.map((person) => person.id),
      filters.userId,
    ),
  };
}

function hasUnknownFilter(
  filters: CompanyFilters,
  options: CompanyFilterOptions,
): boolean {
  const known = keepKnownFilters(filters, options);
  return (
    known.projectId !== filters.projectId || known.userId !== filters.userId
  );
}

function reportQuery(
  range: ReportRange,
  filters: CompanyFilters,
  group: PeriodGroup,
): string {
  const params = setCompanyFilterParams(
    new URLSearchParams({ from: range.from, to: range.to }),
    filters,
  );
  if (group !== DEFAULT_PERIOD_GROUP) params.set("groupBy", group);
  return params.toString();
}

function groupHrefs(
  companyId: number,
  range: ReportRange,
  filters: CompanyFilters,
): Record<PeriodGroup, string> {
  const hrefs = {} as Record<PeriodGroup, string>;

  for (const group of PERIOD_GROUPS) {
    hrefs[group] =
      `/reports/companies/${companyId}?${reportQuery(range, filters, group)}`;
  }

  return hrefs;
}

async function BackLink() {
  const t = await getDictionary();

  return (
    <Link
      href="/reports/companies"
      className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
    >
      <ArrowLeftIcon className="size-4" />
      {t.reports.company.back}
    </Link>
  );
}

function Notice({
  title,
  body,
  tone = "muted",
}: {
  title: string;
  body: string;
  tone?: "muted" | "danger";
}) {
  const danger = tone === "danger";

  return (
    <div
      className={`flex gap-3 rounded-xl border p-5 ${
        danger ? "border-danger-200 bg-danger-50" : "border-line bg-surface"
      }`}
    >
      <AlertIcon
        className={`mt-0.5 size-5 shrink-0 ${danger ? "text-danger-600" : "text-ink-muted"}`}
      />
      <div>
        <p
          className={`text-sm font-semibold ${danger ? "text-danger-700" : "text-ink"}`}
        >
          {title}
        </p>
        <p
          className={`mt-1 text-sm ${danger ? "text-danger-700" : "text-ink-muted"}`}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

export default async function CompanyReportDetailPage({
  params,
  searchParams,
}: PageProps<"/reports/companies/[id]">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const c = t.reports.company;

  if (!canViewHoursReports(actor)) {
    return (
      <div className="mx-auto max-w-2xl">
        <Notice title={t.reports.noAccessTitle} body={t.reports.noAccessBody} />
      </div>
    );
  }

  const { id } = await params;
  const companyId = Number(id);
  const { companies } = await fetchReportScopes();
  const company = companies.find((candidate) => candidate.id === companyId);

  if (!company) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <BackLink />
        <Notice title={c.notFoundTitle} body={c.notFoundBody} />
      </div>
    );
  }

  const query = await searchParams;
  const range = parseRange(query);
  const group = parsePeriodGroup(firstParam(query.groupBy));
  let filters = parseCompanyFilters(query);
  let result = await fetchCompanyReport(company.id, range, filters);

  if (result.ok && hasUnknownFilter(filters, result.report.options)) {
    filters = keepKnownFilters(filters, result.report.options);
    result = await fetchCompanyReport(company.id, range, filters);
  }

  const options = result.ok
    ? result.report.options
    : { projects: [], people: [] };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <BackLink />
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-ink-muted">{c.eyebrow}</p>
          {result.ok ? (
            <ExportLinks
              basePath={`/reports/companies/${company.id}/export`}
              query={reportQuery(range, filters, group)}
            />
          ) : null}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {company.name}
        </h1>
      </div>

      <CompanyRangeFilters
        companyId={company.id}
        range={range}
        filters={filters}
        group={group}
        options={options}
      />

      {!result.ok ? (
        <Notice
          tone="danger"
          title={t.reports.loadErrorTitle}
          body={result.message}
        />
      ) : (
        <>
          <CompanyReportSummary report={result.report} />

          {result.report.totalMinutes > 0 ? (
            <CompanyReportPeriods
              report={result.report}
              group={group}
              groupHref={groupHrefs(company.id, range, filters)}
            />
          ) : null}

          {result.report.totalMinutes === 0 ? (
            <Notice title={c.emptyTitle} body={c.emptyBody} />
          ) : (
            <>
              {filters.projectId !== null ? (
                <CompanyReportProjects report={result.report} />
              ) : null}
              {filters.userId !== null ? (
                <CompanyReportPeople
                  report={result.report}
                  projectId={
                    filters.projectId ? Number(filters.projectId) : undefined
                  }
                />
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
