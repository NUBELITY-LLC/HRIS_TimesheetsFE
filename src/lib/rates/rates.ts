import type { Locale } from "@/i18n/config";
import { intlLocale } from "@/lib/format/datetime";
import { CONTRACT_TYPES, type ContractType } from "@/lib/payroll/pay-terms";

export const RATE_PERIODS = ["HOUR", "MONTH", "YEAR"] as const;
export type RatePeriod = (typeof RATE_PERIODS)[number];
export const DEFAULT_RATE_PERIOD: RatePeriod = "MONTH";

export const CURRENCY_CODES = [
  "USD",
  "MXN",
  "GTQ",
  "HNL",
  "NIO",
  "CRC",
  "PAB",
  "CUP",
  "DOP",
  "HTG",
  "COP",
  "VES",
  "PEN",
  "BOB",
  "CLP",
  "ARS",
  "UYU",
  "PYG",
  "BRL",
] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function readCurrency(value: FormDataEntryValue | null): CurrencyCode | null {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  return (CURRENCY_CODES as readonly string[]).includes(code)
    ? (code as CurrencyCode)
    : null;
}

export function readRatePeriod(value: FormDataEntryValue | null): RatePeriod | null {
  const period = typeof value === "string" ? value.trim().toUpperCase() : "";
  return (RATE_PERIODS as readonly string[]).includes(period)
    ? (period as RatePeriod)
    : null;
}

const displayNames = new Map<Locale, Intl.DisplayNames>();

export function currencyName(code: string, locale: Locale): string {
  let names = displayNames.get(locale);

  if (!names) {
    names = new Intl.DisplayNames(intlLocale(locale), { type: "currency" });
    displayNames.set(locale, names);
  }

  const name = names.of(code);
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
}

export function readContractType(
  value: FormDataEntryValue | null,
): ContractType | null {
  const type = typeof value === "string" ? value.trim().toUpperCase() : "";
  return (CONTRACT_TYPES as readonly string[]).includes(type)
    ? (type as ContractType)
    : null;
}

export function readRateTerms(formData: FormData): {
  currency?: CurrencyCode;
  ratePeriod?: RatePeriod;
  contractType?: ContractType;
} {
  const currency = readCurrency(formData.get("currency"));
  const ratePeriod = readRatePeriod(formData.get("ratePeriod"));
  const contractType = readContractType(formData.get("contractType"));

  return {
    ...(currency ? { currency } : {}),
    ...(ratePeriod ? { ratePeriod } : {}),
    ...(contractType ? { contractType } : {}),
  };
}
