import type { Metadata } from "next";
import Link from "next/link";

import { FeedbackStatusBadge } from "@/components/feedback/feedback-status-badge";
import { InboxFilters } from "@/components/feedback/inbox-filters";
import { InboxHeader } from "@/components/feedback/inbox-header";
import { NoInboxAccess } from "@/components/feedback/no-inbox-access";
import { AlertIcon, ChevronRightIcon, DownloadIcon, PaperclipIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatDay } from "@/lib/audit/format";
import { requireUser } from "@/lib/auth/session";
import { feedbackQuery, parseFeedbackFilters } from "@/lib/feedback/filters";
import { fetchFeedbackCases } from "@/lib/feedback/queries";
import { canReviewFeedback } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.feedback.inbox.title };
}

export default async function FeedbackInboxPage({ searchParams }: PageProps<"/feedback/inbox">) {
  const [t, locale, user] = await Promise.all([getDictionary(), getLocale(), requireUser()]);

  if (!canReviewFeedback(user)) {
    return <NoInboxAccess t={t} body={t.feedback.inbox.noAccessBody} />;
  }

  const filters = parseFeedbackFilters(await searchParams);
  const result = await fetchFeedbackCases(filters);
  const inbox = t.feedback.inbox;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <InboxHeader t={t} active="cases" filters={filters} />
      <InboxFilters t={t} filters={filters} action="/feedback/inbox" showStatus />

      {!result.ok ? (
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger-600" />
          <div>
            <p className="text-sm font-semibold text-danger-700">{inbox.loadErrorTitle}</p>
            <p className="mt-1 text-sm text-danger-700">{result.message}</p>
          </div>
        </div>
      ) : result.items.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-8 text-center">
          <p className="text-sm font-semibold text-ink">{inbox.emptyTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{inbox.emptyBody}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <a
              href={`/feedback/inbox/export${feedbackQuery({ ...filters, page: 1 })}`}
              download
              className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
            >
              <DownloadIcon className="size-4" />
              {inbox.download}
            </a>
          </div>
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-3xl border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-muted text-left">
                    <th className="px-4 py-3 font-semibold text-ink">{inbox.columns.case}</th>
                    <th className="px-4 py-3 font-semibold text-ink">{inbox.columns.submittedOn}</th>
                    <th className="px-4 py-3 font-semibold text-ink">{inbox.columns.category}</th>
                    <th className="px-4 py-3 font-semibold text-ink">{inbox.columns.description}</th>
                    <th className="px-4 py-3 font-semibold text-ink">{inbox.columns.status}</th>
                    <th className="px-4 py-3">
                      <span className="sr-only">{inbox.review}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={item.id} className="border-b border-line align-top last:border-b-0 hover:bg-surface-muted/60">
                      <td className="px-4 py-3 font-semibold whitespace-nowrap text-ink">
                        {inbox.caseLabel(item.id)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                        {formatDay(item.submittedOn, locale)}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{t.feedback.categories[item.category]}</td>
                      <td className="px-4 py-3">
                        <p className="line-clamp-2 text-ink">{item.excerpt}</p>
                        {item.attachmentCount || item.noteCount ? (
                          <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                            {item.attachmentCount ? (
                              <span className="flex items-center gap-1">
                                <PaperclipIcon className="size-3.5" />
                                {inbox.attachments(item.attachmentCount)}
                              </span>
                            ) : null}
                            {item.noteCount ? <span>{inbox.notes(item.noteCount)}</span> : null}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <FeedbackStatusBadge status={item.status} t={t} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/feedback/inbox/${item.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-ink-soft transition-colors hover:bg-surface-muted"
                        >
                          {inbox.review}
                          <ChevronRightIcon className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-muted">
              {inbox.summary(
                result.pagination.total,
                result.pagination.page,
                Math.max(result.pagination.totalPages, 1),
              )}
            </p>
            <div className="flex gap-2">
              {result.pagination.page > 1 ? (
                <Link
                  href={`/feedback/inbox${feedbackQuery({ ...filters, page: result.pagination.page - 1 })}`}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.previous}
                </Link>
              ) : null}
              {result.pagination.page < result.pagination.totalPages ? (
                <Link
                  href={`/feedback/inbox${feedbackQuery({ ...filters, page: result.pagination.page + 1 })}`}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.next}
                </Link>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
