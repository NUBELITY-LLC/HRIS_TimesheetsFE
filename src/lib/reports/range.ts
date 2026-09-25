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
