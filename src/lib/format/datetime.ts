import type { Locale } from "@/i18n/config";

export const APP_TIME_ZONE = "America/Mexico_City";

const INTL_LOCALES: Record<Locale, string> = {
  es: "es-MX",
  en: "en-US",
};

const compactFormatters = new Map<Locale, Intl.DateTimeFormat>();
const fullFormatters = new Map<Locale, Intl.DateTimeFormat>();

function compactFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = compactFormatters.get(locale);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
      timeZone: APP_TIME_ZONE,
      dateStyle: "short",
      timeStyle: "short",
    });
    compactFormatters.set(locale, formatter);
  }

  return formatter;
}

function fullFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = fullFormatters.get(locale);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
      timeZone: APP_TIME_ZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
    fullFormatters.set(locale, formatter);
  }

  return formatter;
}

function parse(value: string | null): Date | null {
  if (!value) return null;

  const withZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
  const date = new Date(withZone);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(
  value: string | null,
  locale: Locale,
  fallbacks: { empty: string; invalid: string },
): string {
  if (!value) return fallbacks.empty;

  const date = parse(value);
  return date ? compactFormatter(locale).format(date) : fallbacks.invalid;
}

export function formatDateTimeLong(
  value: string | null,
  locale: Locale,
  fallbacks: { empty: string; invalid: string },
): string {
  if (!value) return fallbacks.empty;

  const date = parse(value);
  return date ? fullFormatter(locale).format(date) : fallbacks.invalid;
}
