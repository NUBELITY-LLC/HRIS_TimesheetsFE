import type { Locale } from "@/i18n/config";
import { formatMoney, formatRate } from "@/lib/format/money";
import type { PaySummary } from "./pay-terms";

export function hourlyRatesOf(
  pay: Pick<PaySummary, "rates"> | null | undefined,
  fallback: number | null | undefined,
): number[] {
  const rates = pay?.rates?.map((span) => span.hourlyRate) ?? [];
  if (rates.length) return rates;
  return fallback === null || fallback === undefined ? [] : [fallback];
}

export function formatHourlyRates(
  rates: number[],
  currency: string | null | undefined,
  locale: Locale,
): string {
  if (rates.length <= 1) return formatRate(rates[0] ?? null, currency, locale);
  return rates.map((rate) => formatMoney(rate, currency, locale)).join(" → ");
}

export function formatRateRange(
  rates: number[],
  currency: string | null | undefined,
  locale: Locale,
): string {
  const distinct = [...new Set(rates)].sort((left, right) => left - right);
  if (distinct.length <= 1) {
    return formatMoney(distinct[0] ?? null, currency, locale);
  }
  return `${formatMoney(distinct[0], currency, locale)} – ${formatMoney(
    distinct[distinct.length - 1],
    currency,
    locale,
  )}`;
}
