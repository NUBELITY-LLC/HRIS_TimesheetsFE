import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon } from "@/components/icons";
import { PayrollNoAccess } from "@/components/payroll/payroll-no-access";
import { CountrySwitcher } from "@/components/payroll/country-switcher";
import { PayrollRulesForm } from "@/components/payroll/payroll-rules-form";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  countryName,
  DEFAULT_COUNTRY,
  isCountryCode,
} from "@/lib/payroll/countries";
import {
  fetchConfiguredPayrollRules,
  fetchPayrollRules,
} from "@/lib/payroll/queries";
import { canManagePayroll } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.payrollRules.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function PayrollRulesPage({
  searchParams,
}: PageProps<"/payroll-rules">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();

  if (!canManagePayroll(actor)) {
    return <PayrollNoAccess />;
  }

  const requested = firstParam((await searchParams).country).toUpperCase();
  const countryCode = isCountryCode(requested) ? requested : DEFAULT_COUNTRY;
  const [rules, configured] = await Promise.all([
    fetchPayrollRules(countryCode),
    fetchConfiguredPayrollRules(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{t.payrollRules.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {t.payrollRules.title}
          </h1>
        </div>
        <CountrySwitcher value={countryCode} basePath="/payroll-rules" />
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {countryName(countryCode, locale)}
        </h2>
        <div className="space-y-4 p-5">
          {rules === null ? (
            <p className="flex items-center gap-2 text-sm text-danger-700">
              <AlertIcon className="size-4 shrink-0" />
              {t.payrollRules.errors.fallback}
            </p>
          ) : (
            <>
              {rules.configured ? null : (
                <p className="rounded-lg border border-line bg-surface-muted p-3 text-sm text-ink-muted">
                  {t.payrollRules.notConfigured}
                </p>
              )}
              <PayrollRulesForm key={countryCode} rules={rules} />
            </>
          )}
        </div>
      </section>

      {configured.length ? (
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">
            {t.payrollRules.configuredTitle}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {configured.map((item) => (
              <li key={item.countryCode}>
                <Link
                  href={`/payroll-rules?country=${item.countryCode}`}
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    item.countryCode === countryCode
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-line text-ink-soft hover:bg-surface-muted"
                  }`}
                >
                  {countryName(item.countryCode, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
