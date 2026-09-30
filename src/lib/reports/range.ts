import { APP_TIME_ZONE } from "@/lib/format/datetime";
import { addDays, fromISODate, toISODate } from "@/lib/timesheets/week";

export const MAX_RANGE_DAYS = 366;

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayISO(): string {
  return isoDateFormatter.format(new Date());
}

export function isISODate(value: string): boolean {
  return fromISODate(value) !== null;
}

export function rangeDays(from: string, to: string): number {
  const start = fromISODate(from);
  const end = fromISODate(to);

  if (!start || !end) return 0;

  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function monthToDate(): { from: string; to: string } {
  const to = todayISO();
  return { from: `${to.slice(0, 7)}-01`, to };
}

export function normalizeRange(
  from: string,
  to: string,
): {
  from: string;
  to: string;
} {
  const start = isISODate(from) ? from : monthToDate().from;
  const end = isISODate(to) ? to : monthToDate().to;

  if (start > end) return { from: end, to: start };

  if (rangeDays(start, end) > MAX_RANGE_DAYS) {
    const capped = fromISODate(start);
    return {
      from: start,
      to: capped ? toISODate(addDays(capped, MAX_RANGE_DAYS - 1)) : end,
    };
  }

  return { from: start, to: end };
}

export const RANGE_PRESETS = [
  "month",
  "quarter",
  "lastQuarter",
  "year",
] as const;

export type RangePreset = (typeof RANGE_PRESETS)[number];

function isoOf(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function lastDayOf(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function monthsRange(
  year: number,
  firstMonth: number,
  lastMonth: number,
): { from: string; to: string } {
  return {
    from: isoOf(year, firstMonth, 1),
    to: isoOf(year, lastMonth, lastDayOf(year, lastMonth)),
  };
}

export function presetRange(preset: RangePreset): { from: string; to: string } {
  const today = todayISO();
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const quarterStart = Math.floor((month - 1) / 3) * 3 + 1;

  if (preset === "month") return monthsRange(year, month, month);
  if (preset === "year") return monthsRange(year, 1, 12);
  if (preset === "quarter") {
    return monthsRange(year, quarterStart, quarterStart + 2);
  }

  return quarterStart === 1
    ? monthsRange(year - 1, 10, 12)
    : monthsRange(year, quarterStart - 3, quarterStart - 1);
}

export const PERIOD_GROUPS = ["fortnight", "month", "year"] as const;

export type PeriodGroup = (typeof PERIOD_GROUPS)[number];

export const DEFAULT_PERIOD_GROUP: PeriodGroup = "fortnight";

export function parsePeriodGroup(value: string): PeriodGroup {
  return PERIOD_GROUPS.includes(value as PeriodGroup)
    ? (value as PeriodGroup)
    : DEFAULT_PERIOD_GROUP;
}

function periodOf(
  date: string,
  group: PeriodGroup,
): { from: string; to: string } {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));

  if (group === "year") return monthsRange(year, 1, 12);
  if (group === "month") return monthsRange(year, month, month);

  return day <= 15
    ? { from: isoOf(year, month, 1), to: isoOf(year, month, 15) }
    : {
        from: isoOf(year, month, 16),
        to: isoOf(year, month, lastDayOf(year, month)),
      };
}

export function periodsInRange(
  from: string,
  to: string,
  group: PeriodGroup,
): { from: string; to: string }[] {
  const periods: { from: string; to: string }[] = [];
  let cursor = from;

  while (cursor <= to) {
    const period = periodOf(cursor, group);
    periods.push(period);
    const end = fromISODate(period.to);
    if (!end) break;
    cursor = toISODate(addDays(end, 1));
  }

  return periods;
}
