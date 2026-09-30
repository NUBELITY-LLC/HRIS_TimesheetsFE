import Link from "next/link";

import { SearchIcon } from "@/components/icons";
import { CompanyExtraFilters } from "@/components/reports/company-extra-filters";
import { getDictionary } from "@/i18n/server";
import type { ReportRange } from "@/lib/reports/queries";
import {
  DEFAULT_PERIOD_GROUP,
  RANGE_PRESETS,
  presetRange,
  type PeriodGroup,
} from "@/lib/reports/range";
import { setCompanyFilterParams } from "@/lib/reports/scope";
import type { CompanyFilterOptions, CompanyFilters } from "@/lib/reports/types";

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";

export async function CompanySearchFilters({ search }: { search: string }) {
  const t = await getDictionary();
  const c = t.reports.company;

  return (
    <form
      action="/reports/companies"
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
    >
      <div className="min-w-56 flex-1 space-y-1.5">
        <label
          htmlFor="search"
          className="block text-xs font-medium text-ink-soft"
        >
          {c.searchLabel}
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="search"
            name="search"
            type="search"
            maxLength={100}
            defaultValue={search}
            placeholder={c.searchPlaceholder}
            className="w-full rounded-lg border border-line bg-white py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        {t.common.apply}
      </button>
    </form>
  );
}

export async function CompanyRangeFilters({
  companyId,
  range,
  filters,
  options,
  group,
}: {
  companyId: number;
  range: ReportRange;
  filters: CompanyFilters;
  options: CompanyFilterOptions;
  group: PeriodGroup;
}) {
  const t = await getDictionary();
  const c = t.reports.company;
  const d = t.reports.detail;
  const action = `/reports/companies/${companyId}`;

  function presetHref(from: string, to: string): string {
    const params = setCompanyFilterParams(
      new URLSearchParams({ from, to }),
      filters,
    );
    if (group !== DEFAULT_PERIOD_GROUP) params.set("groupBy", group);
    return `${action}?${params.toString()}`;
  }

  return (
    <form
      key={[range.from, range.to, filters.projectId, filters.userId].join(":")}
      action={action}
      method="get"
      className="space-y-3 rounded-xl border border-line bg-surface p-4"
      aria-label={d.rangeLabel}
    >
      {group !== DEFAULT_PERIOD_GROUP ? (
        <input type="hidden" name="groupBy" value={group} />
      ) : null}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="from"
            className="block text-xs font-medium text-ink-soft"
          >
            {d.from}
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={range.from}
            className={FIELD_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="to"
            className="block text-xs font-medium text-ink-soft"
          >
            {d.to}
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={range.to}
            className={FIELD_CLASS}
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t.common.apply}
        </button>
      </div>

      <nav
        className="flex flex-wrap items-center gap-2"
        aria-label={c.presetsLabel}
      >
        <span className="text-xs font-medium text-ink-soft">
          {c.presetsLabel}
        </span>
        {RANGE_PRESETS.map((preset) => {
          const value = presetRange(preset);
          const active = value.from === range.from && value.to === range.to;

          return (
            <Link
              key={preset}
              href={presetHref(value.from, value.to)}
              aria-current={active ? "page" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-line bg-surface text-ink-soft hover:bg-surface-muted"
              }`}
            >
              {c.presets[preset]}
            </Link>
          );
        })}
      </nav>

      <CompanyExtraFilters options={options} filters={filters} />
    </form>
  );
}
