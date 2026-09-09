import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { CatalogNoAccess } from "@/components/catalog/catalog-no-access";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  DEFAULT_CLIENT_FILTERS,
  fetchActiveCompanies,
  fetchClients,
  type CatalogStatus,
  type ClientFilters,
} from "@/lib/catalog/queries";
import { canManageCatalog } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.clients.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ClientFilters {
  const page = Number(firstParam(params.page));
  const companyId = Number(firstParam(params.companyId));
  const status = firstParam(params.status) as CatalogStatus;

  return {
    ...DEFAULT_CLIENT_FILTERS,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: firstParam(params.search).slice(0, 100),
    companyId:
      Number.isInteger(companyId) && companyId > 0 ? String(companyId) : "",
    status: ["active", "inactive", "all"].includes(status) ? status : "active",
  };
}

export default async function ClientsPage({
  searchParams,
}: PageProps<"/managers">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManageCatalog(actor.role.code)) {
    return <CatalogNoAccess roleCode={actor.role.code} />;
  }

  const filters = parseFilters(await searchParams);
  const [result, companies] = await Promise.all([
    fetchClients(filters),
    fetchActiveCompanies(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{t.catalog.clients.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {t.catalog.clients.title}
          </h1>
        </div>
        <Link
          href="/managers/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <PlusIcon className="size-4" />
          {t.catalog.clients.newClient}
        </Link>
      </header>

      <form
        action="/managers"
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
              placeholder={t.catalog.clients.searchPlaceholder}
              className="w-full rounded-lg border border-line bg-white py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="companyId"
            className="block text-xs font-medium text-ink-soft"
          >
            {t.catalog.filters.company}
          </label>
          <select
            id="companyId"
            name="companyId"
            defaultValue={filters.companyId}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            <option value="">{t.catalog.filters.allCompanies}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.tradeName}
              </option>
            ))}
          </select>
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
            <p className="font-medium">{t.catalog.clients.loadErrorTitle}</p>
            <p className="mt-1">{result.message}</p>
          </div>
        </div>
      ) : result.clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-sm font-medium text-ink">
            {t.catalog.clients.emptyTitle}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {t.catalog.clients.emptyBody}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-muted text-left">
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.clients.columns.name}
                  </th>
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.clients.columns.company}
                  </th>
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.clients.columns.email}
                  </th>
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.clients.columns.status}
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-ink">
                    {t.dashboard.columns.action}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-5 py-3.5 font-medium text-ink">
                      {client.clientName}
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">
                      {client.company?.tradeName ?? t.common.none}
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">
                      {client.contactEmail ?? t.common.none}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          client.isActive
                            ? "bg-success-50 text-success-700"
                            : "bg-surface-muted text-ink-muted"
                        }`}
                      >
                        {client.isActive
                          ? t.catalog.clients.active
                          : t.catalog.clients.inactive}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/managers/${client.id}`}
                        className="inline-flex rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                      >
                        {t.catalog.clients.edit}
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
