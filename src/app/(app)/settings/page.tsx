import type { Metadata } from "next";
import Link from "next/link";

import { LanguageForm } from "@/components/settings/language-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { roleName } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.settings.title };
}

export default async function SettingsPage() {
  const user = await requireUser();
  const t = await getDictionary();

  const details = [
    { label: t.dashboard.fields.userName, value: user.userName },
    { label: t.dashboard.fields.email, value: user.email },
    { label: t.dashboard.fields.role, value: roleName(user.role.code, t) },
    { label: t.dashboard.fields.jobTitle, value: user.jobTitle ?? t.common.none },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{t.settings.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.settings.title}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{t.settings.subtitle}</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.settings.languageSection}
        </h2>
        <div className="p-5">
          <LanguageForm />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.settings.passwordSection}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-ink-muted">{t.settings.passwordHint}</p>
          <Link
            href="/change-password"
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
          >
            {t.settings.changePassword}
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.settings.accountSection}
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
        <p className="border-t border-line px-5 py-3.5 text-xs text-ink-muted">
          {t.settings.accountHint}
        </p>
      </section>
    </div>
  );
}
