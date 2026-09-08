"use client";

import { useId, useState } from "react";

import { AlertIcon, CheckIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";

export function DecisionPanel() {
  const t = useDictionary();
  const commentsId = useId();

  const [comments, setComments] = useState("");
  const [decision, setDecision] = useState<"none" | "approved" | "rejected">("none");
  const [error, setError] = useState<string | null>(null);

  function approve() {
    setError(null);
    setDecision("approved");
  }

  function reject() {
    if (!comments.trim()) {
      setDecision("none");
      setError(t.reviews.rejectNeedsComment);
      return;
    }

    setError(null);
    setDecision("rejected");
  }

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
        {t.reviews.decisionTitle}
      </h2>

      <div className="space-y-3 p-5">
        <label htmlFor={commentsId} className="block text-sm font-medium text-ink-soft">
          {t.reviews.commentsLabel}
        </label>
        <textarea
          id={commentsId}
          rows={4}
          maxLength={1000}
          value={comments}
          placeholder={t.reviews.commentsPlaceholder}
          onChange={(event) => {
            setComments(event.target.value);
            setDecision("none");
            setError(null);
          }}
          className={`w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none ${
            error ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200" : "border-line"
          }`}
        />

        {error ? (
          <p role="alert" className="flex gap-2 text-xs text-danger-600">
            <AlertIcon className="mt-0.5 size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={approve}
          className="w-full rounded-lg bg-success-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-success-800"
        >
          {t.reviews.approve}
        </button>
        <button
          type="button"
          onClick={reject}
          className="w-full rounded-lg bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger-700"
        >
          {t.reviews.reject}
        </button>

        {decision === "none" ? null : (
          <div
            role="status"
            aria-live="polite"
            className={`flex gap-2 rounded-lg border p-3 text-xs ${
              decision === "approved"
                ? "border-success-200 bg-success-50 text-success-800"
                : "border-danger-200 bg-danger-50 text-danger-700"
            }`}
          >
            <CheckIcon className="mt-0.5 size-3.5 shrink-0" />
            <span className="space-y-1">
              <span className="block font-medium">
                {decision === "approved"
                  ? t.reviews.approvedTitle
                  : t.reviews.rejectedTitle}
              </span>
              <span className="block">{t.reviews.decisionPending}</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
