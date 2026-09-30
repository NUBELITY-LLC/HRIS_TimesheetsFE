import { ReportScopeSelects } from "@/components/reports/scope-selects";
import { getDictionary } from "@/i18n/server";
import type { ReportRange, ReportScope } from "@/lib/reports/queries";
import type { ReportScopes } from "@/lib/reports/types";

const FIELD_CLASS =
  "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";

export async function ReportRangeFilters({
  personId,
  range,
  scopes,
  scope,
}: {
  personId: number;
  range: ReportRange;
  scopes: ReportScopes;
  scope: ReportScope;
}) {
  const t = await getDictionary();
  const d = t.reports.detail;

  return (
    <form
      action={`/reports/${personId}`}
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
      aria-label={d.rangeLabel}
    >
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
        <label htmlFor="to" className="block text-xs font-medium text-ink-soft">
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

      <ReportScopeSelects scopes={scopes} scope={scope} />

      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        {d.apply}
      </button>
    </form>
  );
}
