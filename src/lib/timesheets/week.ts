import type { Locale } from "@/i18n/config";
import { APP_TIME_ZONE, intlLocale } from "@/lib/format/datetime";

const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEK_LENGTH = 7;

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayFormatters = new Map<Locale, Intl.DateTimeFormat>();
const dayFormatters = new Map<Locale, Intl.DateTimeFormat>();
const rangeFormatters = new Map<Locale, Intl.DateTimeFormat>();

function formatter(
  cache: Map<Locale, Intl.DateTimeFormat>,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  let cached = cache.get(locale);

  if (!cached) {
    cached = new Intl.DateTimeFormat(intlLocale(locale), {
      timeZone: "UTC",
      ...options,
    });
    cache.set(locale, cached);
  }

  return cached;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -((date.getUTCDay() + 6) % 7));
}

export function weekStartFromISO(value: string): string | null {
  const date = fromISODate(value);
  return date ? toISODate(startOfWeek(date)) : null;
}

export function shiftWeekISO(weekStart: string, weeks: number): string {
  const start = fromISODate(weekStart);
  if (!start) return weekStart;

  return toISODate(addDays(start, weeks * WEEK_LENGTH));
}

export function currentWeekStartISO(): string {
  const [year, month, day] = isoDateFormatter
    .format(new Date())
    .split("-")
    .map(Number);

  return toISODate(startOfWeek(new Date(Date.UTC(year, month - 1, day))));
}

export function weekDates(weekStart: string): Date[] {
  const start = fromISODate(weekStart) ?? new Date(0);

  return Array.from({ length: WEEK_LENGTH }, (_, index) =>
    addDays(start, index),
  );
}

export function isWeekend(date: Date): boolean {
  const weekday = date.getUTCDay();
  return weekday === 0 || weekday === 6;
}

export function formatWeekday(date: Date, locale: Locale): string {
  return capitalize(
    formatter(weekdayFormatters, locale, { weekday: "short" }).format(date),
  );
}

export function formatDayAndMonth(date: Date, locale: Locale): string {
  return formatter(dayFormatters, locale, {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatWeekRange(weekStart: string, locale: Locale): string {
  const start = fromISODate(weekStart);
  if (!start) return weekStart;

  return formatter(rangeFormatters, locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatRange(start, addDays(start, WEEK_LENGTH - 1));
}
