import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { CatalogNoAccess } from "@/components/catalog/catalog-no-access";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  DEFAULT_COMPANY_FILTERS,
  fetchCompanies,
  type CatalogStatus,
  type CompanyFilters,
} from "@/lib/catalog/queries";
import { canManageCatalog } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.companies.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): CompanyFilters {
  const page = Number(firstParam(params.page));
  const status = firstParam(params.status) as CatalogStatus;

  return {
    ...DEFAULT_COMPANY_FILTERS,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: firstParam(params.search).slice(0, 100),
    status: ["active", "inactive", "all"].includes(status) ? status : "active",
  };
}

export default async function CompaniesPage({
  searchParams,
}: PageProps<"/companies">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManageCatalog(actor.role.code)) {
    return <CatalogNoAccess roleCode={actor.role.code} />;
  }

  const filters = parseFilters(await searchParams);
  const result = await fetchCompanies(filters);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{t.catalog.companies.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {t.catalog.companies.title}
          </h1>
        </div>
        <Link
          href="/companies/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <PlusIcon className="size-4" />
          {t.catalog.companies.newCompany}
        </Link>
      </header>

      <form
        action="/companies"
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
      >
        <div className="min-w-56 flex-1 space-y-1.5">
          <label htmlFor="search" className="block text-xs font-medium text-ink-soft">
            {t.catalog.filters.search}
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="search"
              name="search"
              type="search"
              maxLength={100}
              defaultValue={filters.search}
              placeholder={t.catalog.companies.searchPlaceholder}
              className="w-full rounded-lg border border-line bg-white py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-xs font-medium text-ink-soft">
            {t.catalog.filters.status}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            <option value="active">{t.catalog.filters.statusActive}</option>
            <option value="inactive">{t.catalog.filters.statusInactive}</option>
            <option value="all">{t.catalog.filters.statusAll}</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t.common.apply}
        </button>
      </form>

      {!result.ok ? (
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5 text-sm text-danger-700">
          <AlertIcon className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">{t.catalog.companies.loadErrorTitle}</p>
            <p className="mt-1">{result.message}</p>
          </div>
        </div>
      ) : result.companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-sm font-medium text-ink">
            {t.catalog.companies.emptyTitle}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {t.catalog.companies.emptyBody}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-muted text-left">
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.companies.columns.name}
                  </th>
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.companies.columns.rfc}
                  </th>
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.companies.columns.status}
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-ink">
                    {t.dashboard.columns.action}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.companies.map((company) => (
                  <tr key={company.id}>
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-ink">
                        {company.tradeName}
                      </span>
                      <span className="block text-ink-muted">
                        {company.legalName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted tabular-nums">
                      {company.rfc ?? t.common.none}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          company.isActive
                            ? "bg-success-50 text-success-700"
                            : "bg-surface-muted text-ink-muted"
                        }`}
                      >
                        {company.isActive
                          ? t.catalog.clients.active
                          : t.catalog.clients.inactive}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/companies/${company.id}`}
                        className="inline-flex rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                      >
                        {t.catalog.companies.edit}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
