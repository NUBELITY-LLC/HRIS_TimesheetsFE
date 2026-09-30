import Link from "next/link";

import { getDictionary } from "@/i18n/server";

const TABS = [
  { key: "people", href: "/reports" },
  { key: "companies", href: "/reports/companies" },
] as const;

export async function ReportTabs({
  active,
}: {
  active: (typeof TABS)[number]["key"];
}) {
  const t = await getDictionary();

  return (
    <nav
      className="flex gap-2 rounded-lg bg-surface-muted p-1 sm:w-fit"
      aria-label={t.reports.tabs.label}
    >
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? "page" : undefined}
          className={`flex-1 rounded-md px-4 py-1.5 text-center text-xs font-semibold transition-colors ${
            active === tab.key
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {t.reports.tabs[tab.key]}
        </Link>
      ))}
    </nav>
  );
}
