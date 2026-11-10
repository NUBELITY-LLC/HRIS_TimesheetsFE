import Link from "next/link";

import type { Dictionary } from "@/i18n/dictionaries";
import { feedbackQuery } from "@/lib/feedback/filters";
import type { FeedbackFilters } from "@/lib/feedback/types";

export function InboxHeader({
  t,
  active,
  filters,
}: {
  t: Dictionary;
  active: "cases" | "report";
  filters: FeedbackFilters;
}) {
  const query = feedbackQuery({ from: filters.from, to: filters.to, category: filters.category });
  const tabs = [
    { key: "cases" as const, href: `/feedback/inbox${query}` },
    { key: "report" as const, href: `/feedback/inbox/report${query}` },
  ];

  return (
    <header className="space-y-4">
      <div>
        <p className="text-sm text-ink-muted">{t.feedback.title}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.feedback.inbox.title}
        </h1>
      </div>
      <nav className="flex gap-2 border-b border-line" aria-label={t.feedback.inbox.title}>
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active === tab.key ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active === tab.key
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-muted hover:text-ink-soft"
            }`}
          >
            {t.feedback.inbox.tabs[tab.key]}
          </Link>
        ))}
      </nav>
    </header>
  );
}
