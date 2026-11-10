import type { Metadata } from "next";
import Link from "next/link";

import { CaseNoteForm } from "@/components/feedback/case-note-form";
import { CaseStatusForm } from "@/components/feedback/case-status-form";
import { FeedbackStatusBadge } from "@/components/feedback/feedback-status-badge";
import { NoInboxAccess } from "@/components/feedback/no-inbox-access";
import { AlertIcon, ArrowLeftIcon, DownloadIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatDay } from "@/lib/audit/format";
import { requireUser } from "@/lib/auth/session";
import { fetchFeedbackCase } from "@/lib/feedback/queries";
import { formatDateTime } from "@/lib/format/datetime";
import { formatFileSize } from "@/lib/timesheets/evidence";
import { canReviewFeedback } from "@/lib/users/roles";

export async function generateMetadata({
  params,
}: PageProps<"/feedback/inbox/[id]">): Promise<Metadata> {
  const [t, { id }] = await Promise.all([getDictionary(), params]);
  return { title: t.feedback.inbox.caseLabel(Number(id)) };
}

export default async function FeedbackCasePage({ params }: PageProps<"/feedback/inbox/[id]">) {
  const [t, locale, user, { id }] = await Promise.all([
    getDictionary(),
    getLocale(),
    requireUser(),
    params,
  ]);

  if (!canReviewFeedback(user)) {
    return <NoInboxAccess t={t} body={t.feedback.inbox.noAccessBody} />;
  }

  const caseId = Number(id);
  const detail = t.feedback.detail;
  const back = (
    <Link
      href="/feedback/inbox"
      className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
    >
      <ArrowLeftIcon className="size-4" />
      {detail.back}
    </Link>
  );

  const result =
    Number.isInteger(caseId) && caseId > 0
      ? await fetchFeedbackCase(caseId)
      : { ok: false as const, notFound: true, message: "" };

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        {back}
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger-600" />
          <div>
            <p className="text-sm font-semibold text-danger-700">
              {result.notFound ? detail.notFoundTitle : detail.loadErrorTitle}
            </p>
            {!result.notFound ? (
              <p className="mt-1 text-sm text-danger-700">{result.message}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const feedbackCase = result.feedbackCase;
  const fallbacks = { empty: "", invalid: "" };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {back}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{t.feedback.categories[feedbackCase.category]}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {t.feedback.inbox.caseLabel(feedbackCase.id)}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {detail.submittedOn(formatDay(feedbackCase.submittedOn, locale))}
          </p>
        </div>
        <FeedbackStatusBadge status={feedbackCase.status} t={t} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">{detail.description}</h2>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-ink">
              {feedbackCase.body}
            </p>

            <h3 className="mt-6 text-sm font-semibold text-ink">{detail.evidence}</h3>
            {feedbackCase.attachments.length ? (
              <ul className="mt-2 space-y-2">
                {feedbackCase.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <a
                      href={`/feedback/inbox/${feedbackCase.id}/evidence/${attachment.id}`}
                      download
                      className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-brand-600 hover:text-brand-700"
                    >
                      <DownloadIcon className="size-4 shrink-0" />
                      <span className="font-medium">{attachment.fileName}</span>
                      <span className="text-xs text-ink-muted">
                        {formatFileSize(attachment.sizeBytes)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">{detail.noEvidence}</p>
            )}
          </section>

          <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">{detail.notesTitle}</h2>
            {feedbackCase.notes.length ? (
              <ol className="mt-3 space-y-3">
                {feedbackCase.notes.map((note) => (
                  <li
                    key={note.id}
                    className={`rounded-lg border px-4 py-3 ${
                      note.kind === "REPLY"
                        ? "border-brand-200 bg-brand-50/50"
                        : "border-line bg-surface-muted"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-ink">
                        {note.author?.name ?? detail.unknownAuthor}
                        <span className="ml-2 font-medium text-ink-muted">
                          {detail.noteKinds[note.kind]}
                        </span>
                      </span>
                      <span className="text-ink-muted">
                        {formatDateTime(note.createdAt, locale, fallbacks)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap text-ink">{note.body}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">{detail.noNotes}</p>
            )}

            <div className="mt-5 border-t border-line pt-5">
              <CaseNoteForm caseId={feedbackCase.id} />
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">{detail.statusTitle}</h2>
          {feedbackCase.status === "RESOLVED" && feedbackCase.resolution ? (
            <div className="rounded-lg bg-success-50 px-3.5 py-3 text-sm text-success-800">
              <p className="text-xs font-semibold">{detail.resolution}</p>
              <p className="mt-1 whitespace-pre-wrap">{feedbackCase.resolution}</p>
            </div>
          ) : null}
          {feedbackCase.status === "RESOLVED" ? (
            <p className="text-sm text-ink-muted">{detail.closedNote}</p>
          ) : (
            <CaseStatusForm
              key={`${feedbackCase.status}-${feedbackCase.statusChangedAt ?? ""}`}
              caseId={feedbackCase.id}
              status={feedbackCase.status}
              resolution={feedbackCase.resolution}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
