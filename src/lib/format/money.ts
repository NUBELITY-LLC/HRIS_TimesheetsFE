import type { Locale } from "@/i18n/config";
import { intlLocale } from "./datetime";

const CURRENCY_CODE = /^[A-Za-z]{3}$/;

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(
  locale: Locale,
  currency: string | null,
  maximumFractionDigits = 2,
): Intl.NumberFormat {
  const key = `${locale}:${currency ?? "plain"}:${maximumFractionDigits}`;
  let cached = formatters.get(key);

  if (!cached) {
    cached = new Intl.NumberFormat(intlLocale(locale), {
      ...(currency ? { style: "currency" as const, currency } : {}),
      minimumFractionDigits: 2,
      maximumFractionDigits,
    });
    formatters.set(key, cached);
  }

  return cached;
}

export function formatRate(
  amount: number | null | undefined,
  currency: string | null | undefined,
  locale: Locale,
): string {
  return formatMoney(amount, currency, locale, "—", 4);
}

export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined,
  locale: Locale,
  fallback = "—",
  maximumFractionDigits = 2,
): string {
  const value = Number(amount);

  if (amount === null || amount === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const code =
    typeof currency === "string" && CURRENCY_CODE.test(currency)
      ? currency.toUpperCase()
      : null;

  return formatter(locale, code, maximumFractionDigits).format(value);
}
