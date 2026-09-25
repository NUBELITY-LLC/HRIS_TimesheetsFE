import type { Metadata } from "next";
import Link from "next/link";

import {
  AlertIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { PayrollNoAccess } from "@/components/payroll/payroll-no-access";
import {
  AddHolidayForm,
  RemoveHolidayButton,
} from "@/components/holidays/holiday-actions";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { fetchHolidays } from "@/lib/holidays/queries";
import { CountrySwitcher } from "@/components/payroll/country-switcher";
import {
  countryName,
  DEFAULT_COUNTRY,
  isCountryCode,
} from "@/lib/payroll/countries";
import { canManagePayroll } from "@/lib/users/roles";
import {
  formatDayAndMonth,
  formatWeekday,
  fromISODate,
} from "@/lib/timesheets/week";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.holidays.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function HolidaysPage({
  searchParams,
}: PageProps<"/holidays">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();

  if (!canManagePayroll(actor)) {
    return <PayrollNoAccess />;
  }

  const params = await searchParams;
  const requestedYear = Number(firstParam(params.year));
  const year =
    Number.isInteger(requestedYear) &&
    requestedYear >= 2000 &&
    requestedYear <= 2100
      ? requestedYear
      : new Date().getFullYear();
  const requestedCountry = firstParam(params.country).toUpperCase();
  const countryCode = isCountryCode(requestedCountry)
    ? requestedCountry
    : DEFAULT_COUNTRY;
  const holidays = await fetchHolidays(year, countryCode);

  const yearLink = (value: number) =>
    `/holidays?${new URLSearchParams({ year: String(value), country: countryCode }).toString()}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{t.holidays.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {t.holidays.title}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {countryName(countryCode, locale)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CountrySwitcher
            value={countryCode}
            basePath="/holidays"
            query={{ year: String(year) }}
          />
          <nav
            aria-label={t.holidays.year}
            className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1"
          >
            <Link
              href={yearLink(year - 1)}
              aria-label={String(year - 1)}
              className="grid size-8 place-items-center rounded-md text-ink-soft hover:bg-surface-muted"
            >
              <ChevronLeftIcon className="size-4" />
            </Link>
            <span className="px-2 text-sm font-semibold text-ink tabular-nums">
              {year}
            </span>
            <Link
              href={yearLink(year + 1)}
              aria-label={String(year + 1)}
              className="grid size-8 place-items-center rounded-md text-ink-soft hover:bg-surface-muted"
            >
              <ChevronRightIcon className="size-4" />
            </Link>
          </nav>
        </div>
      </header>

      <AddHolidayForm countryCode={countryCode} year={year} />

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        {holidays === null ? (
          <p className="flex items-center gap-2 p-5 text-sm text-danger-700">
            <AlertIcon className="size-4 shrink-0" />
            {t.holidays.loadError}
          </p>
        ) : holidays.length === 0 ? (
          <p className="p-5 text-sm text-ink-muted">{t.holidays.empty}</p>
        ) : (
          <ul className="divide-y divide-line">
            {holidays.map((holiday) => {
              const date = fromISODate(holiday.date);

              return (
                <li
                  key={holiday.id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-ink tabular-nums">
                      {date
                        ? `${formatWeekday(date, locale)} ${formatDayAndMonth(date, locale)}`
                        : holiday.date}
                    </span>
                    <span className="text-sm text-ink-soft">
                      {holiday.name}
                    </span>
                  </div>
                  <RemoveHolidayButton id={holiday.id} name={holiday.name} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
