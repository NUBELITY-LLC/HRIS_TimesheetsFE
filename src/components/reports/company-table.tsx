import Link from "next/link";

import { ChevronRightIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";
import type { ScopeCompany, ScopeProject } from "@/lib/reports/types";

export async function ReportCompanyTable({
  companies,
  projects,
}: {
  companies: ScopeCompany[];
  projects: ScopeProject[];
}) {
  const t = await getDictionary();
  const c = t.reports.company;

  function projectCounts(companyId: number) {
    const own = projects.filter((project) => project.companyId === companyId);
    const closed = own.filter((project) => project.isClosed).length;
    return { active: own.length - closed, closed };
  }

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="border-b border-line bg-surface-muted px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">{c.listTitle}</h2>
      </header>

      {companies.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-ink">{c.listEmptyTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{c.listEmptyBody}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-semibold text-ink">
                  {c.columns.company}
                </th>
                <th className="px-5 py-3 text-right font-semibold text-ink">
                  {c.activeProjects}
                </th>
                <th className="px-5 py-3 text-right font-semibold text-ink">
                  {c.closedProjects}
                </th>
                <th className="px-5 py-3 text-right font-semibold text-ink">
                  {c.columns.action}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {companies.map((company) => {
                const counts = projectCounts(company.id);

                return (
                  <tr key={company.id} className="align-middle">
                    <td className="px-5 py-3.5 font-medium text-ink">
                      {company.name}
                    </td>
                    <td className="px-5 py-3.5 text-right text-ink-soft tabular-nums">
                      {counts.active}
                    </td>
                    <td className="px-5 py-3.5 text-right text-ink-muted tabular-nums">
                      {counts.closed}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/reports/companies/${company.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted"
                      >
                        {c.openReport}
                        <ChevronRightIcon className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
