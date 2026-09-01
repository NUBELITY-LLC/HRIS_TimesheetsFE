import type { Metadata } from "next";

import { getDictionary, getLocale } from "@/i18n/server";
import { formatDateTimeLong } from "@/lib/format/datetime";
import { requireUser } from "@/lib/auth/session";
import { roleName } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.dashboard.eyebrow };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();

  const lastLogin = formatDateTimeLong(user.lastLoginAt, locale, {
    empty: t.dashboard.firstLogin,
    invalid: t.common.unknown,
  });

  const details = [
    { label: t.dashboard.fields.userName, value: user.userName },
    { label: t.dashboard.fields.email, value: user.email },
    { label: t.dashboard.fields.role, value: roleName(user.role.code, t) },
    { label: t.dashboard.fields.jobTitle, value: user.jobTitle ?? t.common.none },
    { label: t.dashboard.fields.lastLogin, value: lastLogin },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{t.dashboard.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.dashboard.welcome(user.fullName.split(" ")[0])}
        </h1>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.dashboard.accountSection}
        </h2>
        <dl className="divide-y divide-line">
          {details.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center"
            >
              <dt className="text-sm text-ink-muted sm:w-48">{label}</dt>
              <dd className="text-sm font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-dashed border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-ink">
          {t.dashboard.timesheetTitle}
        </h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          {t.dashboard.timesheetBody}
        </p>
      </section>
    </div>
  );
}
