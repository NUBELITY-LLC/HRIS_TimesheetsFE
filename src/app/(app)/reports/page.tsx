import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon } from "@/components/icons";
import { ReportPeopleFilters } from "@/components/reports/people-filters";
import { ReportPeopleTable } from "@/components/reports/people-table";
import { ReportTabs } from "@/components/reports/report-tabs";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  DEFAULT_PEOPLE_FILTERS,
  PEOPLE_STATUSES,
  fetchReportPeople,
  fetchReportScopes,
  setScopeParams,
  type PeopleFilters,
  type PeopleStatus,
  type ReportRange,
} from "@/lib/reports/queries";
import { monthToDate, normalizeRange } from "@/lib/reports/range";
import { parseScope } from "@/lib/reports/scope";
import type { ReportScopes } from "@/lib/reports/types";
import { canViewHoursReports } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.reports.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
  scopes: ReportScopes,
): PeopleFilters {
  const page = Number(firstParam(params.page));
  const status = firstParam(params.status) as PeopleStatus;

  return {
    ...DEFAULT_PEOPLE_FILTERS,
    ...parseScope(params, scopes),
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: firstParam(params.search).slice(0, 100),
    status: PEOPLE_STATUSES.includes(status)
      ? status
      : DEFAULT_PEOPLE_FILTERS.status,
  };
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

function pageHref(filters: PeopleFilters, page: number): string {
  const params = new URLSearchParams({
    page: String(page),
    status: filters.status,
  });

  if (filters.search) params.set("search", filters.search);
  setScopeParams(params, filters);

  return `/reports?${params.toString()}`;
}

export default async function ReportsPage({
  searchParams,
}: PageProps<"/reports">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canViewHoursReports(actor)) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <div>
            <h1 className="text-sm font-semibold text-ink">
              {t.reports.noAccessTitle}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {t.reports.noAccessBody}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const scopes = await fetchReportScopes();
  const filters = parseFilters(params, scopes);
  const range = parseRange(params);
  const result = await fetchReportPeople(filters);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{t.reports.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.reports.title}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">{t.reports.intro}</p>
      </header>

      <ReportTabs active="people" />

      <ReportPeopleFilters filters={filters} scopes={scopes} />

      {result.ok ? (
        <>
          <ReportPeopleTable
            people={result.people}
            range={range}
            scope={filters}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-muted">
              {t.reports.people.summary(
                result.pagination.total,
                result.pagination.page,
                Math.max(result.pagination.totalPages, 1),
              )}
            </p>
            <div className="flex gap-2">
              {result.pagination.page > 1 ? (
                <Link
                  href={pageHref(filters, result.pagination.page - 1)}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.previous}
                </Link>
              ) : null}
              {result.pagination.page < result.pagination.totalPages ? (
                <Link
                  href={pageHref(filters, result.pagination.page + 1)}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.next}
                </Link>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger-600" />
          <div>
            <p className="text-sm font-semibold text-danger-700">
              {t.reports.loadErrorTitle}
            </p>
            <p className="mt-1 text-sm text-danger-700">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
