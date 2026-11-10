import type { Metadata } from "next";

import { InboxFilters } from "@/components/feedback/inbox-filters";
import { InboxHeader } from "@/components/feedback/inbox-header";
import { NoInboxAccess } from "@/components/feedback/no-inbox-access";
import { AlertIcon, DownloadIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { feedbackQuery, parseFeedbackFilters } from "@/lib/feedback/filters";
import { fetchFeedbackReport } from "@/lib/feedback/queries";
import { FEEDBACK_STATUSES } from "@/lib/feedback/types";
import { intlLocale } from "@/lib/format/datetime";
import { canReviewFeedback } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: `${t.feedback.inbox.tabs.report} · ${t.feedback.inbox.title}` };
}

function monthLabel(month: string, locale: string): string {
  const [year, value] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year!, value! - 1, 1)),
  );
}

export default async function FeedbackReportPage({
  searchParams,
}: PageProps<"/feedback/inbox/report">) {
  const [t, locale, user] = await Promise.all([getDictionary(), getLocale(), requireUser()]);

  if (!canReviewFeedback(user)) {
    return <NoInboxAccess t={t} body={t.feedback.inbox.noAccessBody} />;
  }

  const filters = parseFeedbackFilters(await searchParams);
  const result = await fetchFeedbackReport(filters);
  const r = t.feedback.report;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <InboxHeader t={t} active="report" filters={filters} />
      <InboxFilters t={t} filters={filters} action="/feedback/inbox/report" showStatus={false} />

      {!result.ok ? (
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger-600" />
          <div>
            <p className="text-sm font-semibold text-danger-700">{r.loadErrorTitle}</p>
            <p className="mt-1 text-sm text-danger-700">{result.message}</p>
          </div>
        </div>
      ) : result.report.total === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-8 text-center">
          <p className="text-sm font-semibold text-ink">{r.empty}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <a
              href={`/feedback/inbox/report/export${feedbackQuery({
                from: filters.from,
                to: filters.to,
                category: filters.category,
              })}`}
              download
              className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
            >
              <DownloadIcon className="size-4" />
              {r.download}
            </a>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: r.total, value: result.report.total },
              {
                label: r.open,
                value: result.report.byStatus.NEW + result.report.byStatus.IN_REVIEW,
              },
              { label: r.resolved, value: result.report.byStatus.RESOLVED },
              { label: r.archived, value: result.report.byStatus.ARCHIVED },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
                <dt className="text-sm text-ink-muted">{card.label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-ink tabular-nums">{card.value}</dd>
              </div>
            ))}
          </dl>

          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <h2 className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">
              {r.byCategory}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-2xl border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-muted text-left">
                    <th className="px-4 py-2.5 font-semibold text-ink">{r.category}</th>
                    {FEEDBACK_STATUSES.map((status) => (
                      <th key={status} className="px-4 py-2.5 text-right font-semibold text-ink">
                        {t.feedback.statuses[status]}
                      </th>
                    ))}
                    <th className="px-4 py-2.5 text-right font-semibold text-ink">{r.totalColumn}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.report.byCategory.map((row) => (
                    <tr key={row.category} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-2.5 text-ink">{t.feedback.categories[row.category]}</td>
                      {FEEDBACK_STATUSES.map((status) => (
                        <td key={status} className="px-4 py-2.5 text-right text-ink-soft tabular-nums">
                          {row.byStatus[status]}
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-right font-semibold text-ink tabular-nums">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <h2 className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">{r.byMonth}</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-muted text-left">
                  <th className="px-4 py-2.5 font-semibold text-ink">{r.month}</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-ink">{r.totalColumn}</th>
                </tr>
              </thead>
              <tbody>
                {result.report.byMonth.map((row) => (
                  <tr key={row.month} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-2.5 text-ink capitalize">
                      {monthLabel(row.month, intlLocale(locale))}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-ink tabular-nums">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
