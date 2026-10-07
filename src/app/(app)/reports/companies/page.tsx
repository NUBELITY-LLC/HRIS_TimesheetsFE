import type { Metadata } from "next";

import { AlertIcon } from "@/components/icons";
import { CompanySearchFilters } from "@/components/reports/company-filters";
import { ReportCompanyTable } from "@/components/reports/company-table";
import { ReportTabs } from "@/components/reports/report-tabs";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { fetchReportScopes } from "@/lib/reports/queries";
import { canViewHoursReports } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.reports.company.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export default async function CompanyReportsPage({
  searchParams,
}: PageProps<"/reports/companies">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const c = t.reports.company;

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
  const search = firstParam(params.search).slice(0, 100);
  const { companies, projects } = await fetchReportScopes();
  const term = normalize(search);
  const visible = term
    ? companies.filter((company) => normalize(company.name).includes(term))
    : companies;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{t.reports.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {c.title}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">{c.intro}</p>
      </header>

      <ReportTabs active="companies" />

      {companies.length === 0 ? (
        <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <div>
            <p className="text-sm font-semibold text-ink">
              {c.noCompaniesTitle}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{c.noCompaniesBody}</p>
          </div>
        </div>
      ) : (
        <>
          <CompanySearchFilters search={search} />

          <ReportCompanyTable companies={visible} projects={projects} />

          <p className="text-sm text-ink-muted">{c.summary(visible.length)}</p>
        </>
      )}
    </div>
  );
}
