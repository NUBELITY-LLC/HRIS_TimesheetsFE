"use client";

import { useActionState, useId } from "react";

import { AlertIcon, SearchIcon, SpinnerIcon } from "@/components/icons";
import { useDictionary, useLocale } from "@/i18n/provider";
import { formatDay } from "@/lib/audit/format";
import { trackFeedbackAction } from "@/lib/feedback/actions";
import { INITIAL_TRACK_FEEDBACK_STATE, type FeedbackStatus } from "@/lib/feedback/types";
import { formatDateTime } from "@/lib/format/datetime";
import { FIELD_CLASS, LABEL_CLASS, SECONDARY_BUTTON_CLASS } from "./styles";

const STATUS_CLASS: Record<FeedbackStatus, string> = {
  NEW: "bg-brand-50 text-brand-700",
  IN_REVIEW: "bg-warn-50 text-warn-700",
  RESOLVED: "bg-success-50 text-success-700",
  ARCHIVED: "bg-surface-muted text-ink-muted",
};

export function TrackFeedbackForm() {
  const t = useDictionary();
  const locale = useLocale();
  const codeId = useId();
  const [state, formAction, isPending] = useActionState(
    trackFeedbackAction,
    INITIAL_TRACK_FEEDBACK_STATE,
  );
  const result = state.status === "found" ? state.result : null;

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-1.5" noValidate>
        <label htmlFor={codeId} className={LABEL_CLASS}>
          {t.feedback.tracking.code}
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id={codeId}
            name="code"
            defaultValue={state.code}
            autoComplete="off"
            spellCheck={false}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            disabled={isPending}
            className={`${FIELD_CLASS} min-w-0 flex-1 font-mono uppercase`}
          />
          <button type="submit" disabled={isPending} className={SECONDARY_BUTTON_CLASS}>
            {isPending ? (
              <SpinnerIcon className="size-4 animate-spin" />
            ) : (
              <SearchIcon className="size-4" />
            )}
            {isPending ? t.feedback.tracking.submitting : t.feedback.tracking.submit}
          </button>
        </div>
        <p className="text-xs text-ink-muted">{t.feedback.tracking.hint}</p>
      </form>

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-4 rounded-lg border border-line p-4" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {t.feedback.categories[result.category]}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {t.feedback.tracking.submittedOn(formatDay(result.submittedOn, locale))}
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[result.status]}`}
            >
              {t.feedback.statuses[result.status]}
            </span>
          </div>

          {result.resolution ? (
            <div className="rounded-lg bg-success-50 px-3.5 py-3 text-sm text-success-800">
              <p className="text-xs font-semibold">{t.feedback.tracking.resolution}</p>
              <p className="mt-1 whitespace-pre-wrap">{result.resolution}</p>
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              {t.feedback.tracking.replies}
            </p>
            {result.replies.length ? (
              <ul className="space-y-2">
                {result.replies.map((reply, index) => (
                  <li key={index} className="rounded-lg bg-surface-muted px-3.5 py-3">
                    <p className="text-sm whitespace-pre-wrap text-ink">{reply.body}</p>
                    <p className="mt-1.5 text-xs text-ink-muted">
                      {formatDateTime(reply.createdAt, locale, { empty: "", invalid: "" })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">{t.feedback.tracking.noReplies}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
