import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { CatalogNoAccess } from "@/components/catalog/catalog-no-access";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  DEFAULT_PROJECT_FILTERS,
  fetchActiveClients,
  fetchProjects,
  type ProjectFilters,
  type ProjectStatusFilter,
} from "@/lib/catalog/queries";
import { isProjectClosed, projectLifecycleLabel } from "@/lib/catalog/lifecycle";
import { formatDayAndMonth, fromISODate } from "@/lib/timesheets/week";
import { canManageCatalog } from "@/lib/users/roles";
import type { Locale } from "@/i18n/config";

const PROJECT_STATUS_FILTERS: ProjectStatusFilter[] = ["ACTIVE", "CLOSED", "all"];

function parseStatus(value: string): ProjectStatusFilter {
  return (
    PROJECT_STATUS_FILTERS.find((status) => status === value) ??
    DEFAULT_PROJECT_FILTERS.status
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.projects.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ProjectFilters {
  const page = Number(firstParam(params.page));
  const clientId = Number(firstParam(params.clientId));

  return {
    ...DEFAULT_PROJECT_FILTERS,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: firstParam(params.search).slice(0, 100),
    clientId: Number.isInteger(clientId) && clientId > 0 ? String(clientId) : "",
    status: parseStatus(firstParam(params.status)),
  };
}

function formatDate(value: string | null, locale: Locale, empty: string): string {
  const date = value ? fromISODate(value) : null;
  return date ? formatDayAndMonth(date, locale) : empty;
}

export default async function ProjectsPage({
  searchParams,
}: PageProps<"/projects">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();

  if (!canManageCatalog(actor.role.code)) {
    return <CatalogNoAccess roleCode={actor.role.code} />;
  }

  const filters = parseFilters(await searchParams);
  const [result, clients] = await Promise.all([
    fetchProjects(filters),
    fetchActiveClients(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{t.catalog.projects.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {t.catalog.projects.title}
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <PlusIcon className="size-4" />
          {t.catalog.projects.newProject}
        </Link>
      </header>

      <form
        action="/projects"
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
              placeholder={t.catalog.projects.searchPlaceholder}
              className="w-full rounded-lg border border-line bg-white py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="clientId" className="block text-xs font-medium text-ink-soft">
            {t.catalog.filters.client}
          </label>
          <select
            id="clientId"
            name="clientId"
            defaultValue={filters.clientId}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            <option value="">{t.catalog.filters.allClients}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.clientName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-xs font-medium text-ink-soft">
            {t.catalog.filters.projectStatus}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            <option value="ACTIVE">{t.catalog.filters.projectStatusActive}</option>
            <option value="CLOSED">{t.catalog.filters.projectStatusClosed}</option>
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
            <p className="font-medium">{t.catalog.projects.loadErrorTitle}</p>
            <p className="mt-1">{result.message}</p>
          </div>
        </div>
      ) : result.projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-sm font-medium text-ink">
            {t.catalog.projects.emptyTitle}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {t.catalog.projects.emptyBody}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-muted text-left">
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.projects.columns.name}
                  </th>
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.projects.columns.client}
                  </th>
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.projects.columns.manager}
                  </th>
                  <th className="px-5 py-3 font-semibold text-ink">
                    {t.catalog.projects.columns.dates}
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-ink">
                    {t.dashboard.columns.action}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2 font-medium text-ink">
                        {project.projectName}
                        {isProjectClosed(project) ? (
                          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-ink-muted">
                            {t.catalog.lifecycle.statusClosed}
                          </span>
                        ) : null}
                      </span>
                      {project.code ? (
                        <span className="block text-ink-muted">{project.code}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">
                      {project.client?.name ?? t.common.none}
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">
                      {project.manager?.fullName ?? t.catalog.projects.noManager}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-ink-muted">
                      <span className="block">
                        {projectLifecycleLabel(project, locale, t)}
                      </span>
                      {project.startDate ? (
                        <span className="block text-xs">
                          {t.catalog.projects.since(
                            formatDate(project.startDate, locale, t.common.none),
                          )}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                      >
                        {t.catalog.projects.edit}
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
