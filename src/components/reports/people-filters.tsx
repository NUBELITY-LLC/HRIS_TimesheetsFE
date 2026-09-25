import { SearchIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";
import type { PeopleFilters } from "@/lib/reports/queries";

export async function ReportPeopleFilters({
  filters,
}: {
  filters: PeopleFilters;
}) {
  const t = await getDictionary();
  const p = t.reports.people;

  return (
    <form
      action="/reports"
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
    >
      <div className="min-w-56 flex-1 space-y-1.5">
        <label
          htmlFor="search"
          className="block text-xs font-medium text-ink-soft"
        >
          {p.searchLabel}
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="search"
            name="search"
            type="search"
            maxLength={100}
            defaultValue={filters.search}
            placeholder={p.searchPlaceholder}
            className="w-full rounded-lg border border-line bg-white py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="status"
          className="block text-xs font-medium text-ink-soft"
        >
          {p.statusLabel}
        </label>
        <select
          id="status"
          name="status"
          defaultValue={filters.status}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
        >
          <option value="active">{p.statusActive}</option>
          <option value="inactive">{p.statusInactive}</option>
          <option value="all">{p.statusAll}</option>
        </select>
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
