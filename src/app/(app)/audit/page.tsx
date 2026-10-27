import type { Metadata } from "next";
import Link from "next/link";

import { AuditExportPanel } from "@/components/audit/audit-export-panel";
import { AuditFiltersForm } from "@/components/audit/audit-filters";
import { AuditTable } from "@/components/audit/audit-table";
import { AlertIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";
import {
  auditHref,
  auditSearchParams,
  parseAuditFilters,
} from "@/lib/audit/filters";
import { fetchAuditEntries, fetchAuditOptions } from "@/lib/audit/queries";
import { requireUser } from "@/lib/auth/session";
import { canViewAudit } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.audit.title };
}

export default async function AuditPage({ searchParams }: PageProps<"/audit">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const a = t.audit;

  if (!canViewAudit(actor)) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <div>
            <h1 className="text-sm font-semibold text-ink">{a.noAccessTitle}</h1>
            <p className="mt-1 text-sm text-ink-muted">{a.noAccessBody}</p>
          </div>
        </div>
      </div>
    );
  }

  const filters = parseAuditFilters(await searchParams);
  const [result, options] = await Promise.all([
    fetchAuditEntries(filters),
    fetchAuditOptions(),
  ]);
  const exportFields = [
    ...auditSearchParams(filters, { page: 1 }).entries(),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header>
        <p className="text-sm text-ink-muted">{a.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {a.title}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">{a.intro}</p>
      </header>

      <AuditFiltersForm filters={filters} options={options} />

      <AuditExportPanel hiddenFields={exportFields} />

      {!result.ok ? (
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5 text-sm text-danger-700">
          <AlertIcon className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">{a.loadErrorTitle}</p>
            <p className="mt-1">{result.message}</p>
          </div>
        </div>
      ) : result.entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-sm font-medium text-ink">{a.emptyTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{a.emptyBody}</p>
        </div>
      ) : (
        <>
          <AuditTable entries={result.entries} filters={filters} />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-muted">
              {a.summary(
                result.pagination.total,
                result.pagination.page,
                Math.max(result.pagination.totalPages, 1),
              )}
            </p>
            <div className="flex gap-2">
              {result.pagination.page > 1 ? (
                <Link
                  href={auditHref(filters, { page: result.pagination.page - 1 })}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.previous}
                </Link>
              ) : null}
              {result.pagination.page < result.pagination.totalPages ? (
                <Link
                  href={auditHref(filters, { page: result.pagination.page + 1 })}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.next}
                </Link>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
