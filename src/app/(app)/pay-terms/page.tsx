import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, SearchIcon } from "@/components/icons";
import { PayrollNoAccess } from "@/components/payroll/payroll-no-access";
import { PayTermsRow } from "@/components/payroll/pay-terms-row";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  CONTRACT_TYPES,
  type ContractType,
  type PayAssignmentFilters,
} from "@/lib/payroll/pay-terms";
import { fetchPayAssignments } from "@/lib/payroll/queries";
import { canManagePayroll } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.payTermsPage.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): PayAssignmentFilters {
  const page = Number(firstParam(params.page));
  const contractType = firstParam(params.contractType);
  const status = firstParam(params.status);

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: firstParam(params.search).trim().slice(0, 100),
    contractType: (CONTRACT_TYPES as readonly string[]).includes(contractType)
      ? (contractType as ContractType)
      : "",
    status: status === "inactive" || status === "all" ? status : "active",
  };
}

function pageHref(filters: PayAssignmentFilters, page: number): string {
  const params = new URLSearchParams({
    page: String(page),
    status: filters.status,
  });
  if (filters.search) params.set("search", filters.search);
  if (filters.contractType) params.set("contractType", filters.contractType);
  return `/pay-terms?${params.toString()}`;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";

export default async function PayTermsPage({
  searchParams,
}: PageProps<"/pay-terms">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManagePayroll(actor)) {
    return <PayrollNoAccess />;
  }

  const filters = parseFilters(await searchParams);
  const result = await fetchPayAssignments(filters);
  const copy = t.payTermsPage;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{copy.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {copy.title}
        </h1>
      </header>

      <form
        action="/pay-terms"
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
      >
        <div className="min-w-56 flex-1 space-y-1.5">
          <label
            htmlFor="search"
            className="block text-xs font-medium text-ink-soft"
          >
            {copy.search}
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="search"
              name="search"
              type="search"
              defaultValue={filters.search}
              placeholder={copy.searchPlaceholder}
              maxLength={100}
              className={`${INPUT_CLASS} pl-9`}
            />
          </div>
        </div>
        <div className="w-40 space-y-1.5">
          <label
            htmlFor="contractType"
            className="block text-xs font-medium text-ink-soft"
          >
            {copy.contractType}
          </label>
          <select
            id="contractType"
            name="contractType"
            defaultValue={filters.contractType}
            className={INPUT_CLASS}
          >
            <option value="">{copy.allContracts}</option>
            {CONTRACT_TYPES.map((code) => (
              <option key={code} value={code}>
                {t.payTerms.contractTypes[code]}
              </option>
            ))}
          </select>
        </div>
        <div className="w-36 space-y-1.5">
          <label
            htmlFor="status"
            className="block text-xs font-medium text-ink-soft"
          >
            {copy.status}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status}
            className={INPUT_CLASS}
          >
            <option value="active">{copy.statusActive}</option>
            <option value="inactive">{copy.statusInactive}</option>
            <option value="all">{copy.statusAll}</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {copy.filter}
        </button>
      </form>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        {result === null ? (
          <p className="flex items-center gap-2 p-5 text-sm text-danger-700">
            <AlertIcon className="size-4 shrink-0" />
            {copy.loadError}
          </p>
        ) : result.assignments.length === 0 ? (
          <p className="p-5 text-sm text-ink-muted">{copy.empty}</p>
        ) : (
          <ul className="divide-y divide-line">
            {result.assignments.map((assignment) => (
              <PayTermsRow key={assignment.id} assignment={assignment} />
            ))}
          </ul>
        )}
      </section>

      {result && result.pagination.totalPages > 0 ? (
        <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-ink-muted">
            {copy.summary(
              result.pagination.total,
              result.pagination.page,
              result.pagination.totalPages,
            )}
          </p>
          <div className="flex gap-2">
            {result.pagination.page > 1 ? (
              <Link
                href={pageHref(filters, result.pagination.page - 1)}
                className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink-soft hover:bg-surface-muted"
              >
                {copy.previous}
              </Link>
            ) : null}
            {result.pagination.page < result.pagination.totalPages ? (
              <Link
                href={pageHref(filters, result.pagination.page + 1)}
                className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink-soft hover:bg-surface-muted"
              >
                {copy.next}
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
