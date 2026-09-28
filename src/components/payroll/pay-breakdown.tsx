import { getDictionary, getLocale } from "@/i18n/server";
import { formatMoney, formatRate } from "@/lib/format/money";
import { countryName } from "@/lib/payroll/countries";
import type { PaySummary } from "@/lib/payroll/pay-terms";
import { formatMinutes } from "@/lib/timesheets/rules";
import { formatHourlyRates, hourlyRatesOf } from "@/lib/payroll/rate-spans";

export async function PayBreakdown({
  pay,
  currency,
}: {
  pay: PaySummary;
  currency: string;
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const mixedRates = hourlyRatesOf(pay, pay.hourlyRate).length > 1;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line bg-surface-muted px-5 py-3.5">
        <h2 className="text-sm font-semibold text-ink">
          {t.payTerms.breakdownTitle}
        </h2>
        <p className="text-xs text-ink-muted">
          {t.payTerms.contractTypes[pay.contractType]} ·{" "}
          {countryName(pay.countryCode, locale)} · {t.payTerms.hourlyRate}{" "}
          {formatHourlyRates(hourlyRatesOf(pay, pay.hourlyRate), currency, locale)}
        </p>
      </div>
      <table className="w-full border-collapse text-sm">
        <tbody className="divide-y divide-line">
          {pay.lines.map((line) => (
            <tr key={`${line.bucket}-${line.multiplier}-${line.hourlyRate ?? ""}`}>
              <td className="px-5 py-2.5 text-ink">
                {t.payTerms.buckets[line.bucket]}
                {mixedRates && line.hourlyRate !== undefined ? (
                  <span className="ml-2 text-xs text-ink-muted">
                    {t.payTerms.atRate(formatRate(line.hourlyRate, currency, locale))}
                  </span>
                ) : null}
              </td>
              <td className="px-5 py-2.5 text-right text-ink-soft tabular-nums">
                {formatMinutes(line.minutes)}
              </td>
              <td className="px-5 py-2.5 text-right text-ink-muted tabular-nums">
                ×{line.multiplier}
              </td>
              <td className="px-5 py-2.5 text-right font-medium text-ink tabular-nums">
                {formatMoney(line.amount, currency, locale)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line bg-surface-muted">
            <td className="px-5 py-3 font-semibold text-ink">
              {t.reviews.totalHours}
            </td>
            <td className="px-5 py-3 text-right font-semibold text-ink tabular-nums">
              {formatMinutes(pay.minutes)}
            </td>
            <td />
            <td className="px-5 py-3 text-right font-semibold text-brand-600 tabular-nums">
              {formatMoney(pay.amount, currency, locale)}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
