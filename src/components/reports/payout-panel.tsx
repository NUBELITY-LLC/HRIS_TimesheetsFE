import { getDictionary, getLocale } from "@/i18n/server";
import { formatMoney } from "@/lib/format/money";
import { formatRateRange } from "@/lib/payroll/rate-spans";
import { formatMinutes } from "@/lib/timesheets/rules";
import type { HoursReport } from "@/lib/reports/types";

export async function PayoutPanel({ report }: { report: HoursReport }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const d = t.reports.detail;

  const single = report.totals.length === 1 ? report.totals[0] : null;
  const hourlyRates = single
    ? report.days.flatMap((day) =>
        day.entries
          .filter((entry) => entry.minutes > 0)
          .map((entry) => entry.hourlyRate),
      )
    : [];

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-navy-900 text-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-6 px-6 py-5">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            {d.payoutTitle}
          </p>
          {report.totals.length === 0 ? (
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
              {t.common.none}
            </p>
          ) : (
            report.totals.map((total) => (
              <p
                key={total.currency}
                className="mt-1 text-3xl font-semibold tracking-tight tabular-nums"
              >
                {formatMoney(total.amount, total.currency, locale)}
              </p>
            ))
          )}
          {report.totals.length > 1 ? (
            <p className="mt-1 text-xs text-slate-400">{d.mixedCurrencies}</p>
          ) : null}
        </div>

        <dl className="flex gap-8">
          <div>
            <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              {d.totalHours}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatMinutes(report.totalMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              {d.hourCost}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {formatRateRange(hourlyRates, single?.currency ?? null, locale)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
