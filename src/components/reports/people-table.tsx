import Link from "next/link";

import { ChevronRightIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";
import {
  setScopeParams,
  type ReportRange,
  type ReportScope,
} from "@/lib/reports/queries";
import type { ReportPerson } from "@/lib/reports/types";
import { roleName } from "@/lib/users/roles";

export async function ReportPeopleTable({
  people,
  range,
  scope,
}: {
  people: ReportPerson[];
  range: ReportRange;
  scope: ReportScope;
}) {
  const t = await getDictionary();
  const p = t.reports.people;

  function href(person: ReportPerson): string {
    const params = new URLSearchParams({
      from: range.from,
      to: range.to,
    });
    setScopeParams(params, scope);

    return `/reports/${person.id}?${params.toString()}`;
  }

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="border-b border-line bg-surface-muted px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">{p.listTitle}</h2>
      </header>

      {people.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-ink">{p.emptyTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{p.emptyBody}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-semibold text-ink">
                  {p.columns.person}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {p.columns.role}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {p.columns.email}
                </th>
                <th className="px-5 py-3 font-semibold text-ink">
                  {p.columns.status}
                </th>
                <th className="px-5 py-3 text-right font-semibold text-ink">
                  {p.columns.action}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {people.map((person) => (
                <tr key={person.id} className="align-middle">
                  <td className="px-5 py-3.5">
                    <span className="block font-medium text-ink">
                      {person.fullName}
                    </span>
                    <span className="block text-ink-muted">
                      {person.jobTitle ?? t.common.none}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">
                    {roleName(person.roleCode, t)}
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{person.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        person.isActive
                          ? "bg-success-50 text-success-700"
                          : "bg-surface-muted text-ink-muted"
                      }`}
                    >
                      {person.isActive ? p.active : p.inactive}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={href(person)}
                      className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted"
                    >
                      {p.open}
                      <ChevronRightIcon className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
