"use client";

import { useActionState, useId } from "react";

import {
  AlertIcon,
  CheckIcon,
  PaperclipIcon,
  SpinnerIcon,
} from "@/components/icons";
import { useConfirmedSubmit } from "@/components/ui/use-confirm";
import { useDictionary } from "@/i18n/provider";
import { approveOnBehalfAction } from "@/lib/approvals/actions";
import {
  EVIDENCE_ACCEPT,
  INITIAL_APPROVE_ON_BEHALF_STATE,
  ON_BEHALF_COMMENTS_MAX,
} from "@/lib/approvals/form-state";

export function ApproveOnBehalfForm({
  approvalId,
  approverLabel,
}: {
  approvalId: number;
  approverLabel: string;
}) {
  const t = useDictionary();
  const commentsId = useId();
  const evidenceId = useId();
  const [state, formAction, isPending] = useActionState(
    approveOnBehalfAction,
    INITIAL_APPROVE_ON_BEHALF_STATE,
  );
  const { guard, dialog } = useConfirmedSubmit();

  if (state.status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="flex items-start gap-2 rounded-lg bg-success-50 p-3 text-sm text-success-800"
      >
        <CheckIcon className="mt-0.5 size-4 shrink-0" />
        {state.message}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={guard({
        title: t.approvals.onBehalf.confirm(approverLabel),
        body: t.approvals.onBehalf.intro,
        confirmLabel: t.approvals.onBehalf.submit,
      })}
      className="space-y-3"
    >
      {dialog}
      <input type="hidden" name="approvalId" value={approvalId} />

      <p className="flex gap-2 rounded-lg bg-warn-50 p-3 text-xs text-warn-700">
        <AlertIcon className="mt-0.5 size-3.5 shrink-0" />
        {t.approvals.onBehalf.intro}
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor={commentsId}
          className="block text-[10px] font-semibold tracking-wide text-ink-muted uppercase"
        >
          {t.approvals.onBehalf.commentsLabel}
        </label>
        <textarea
          id={commentsId}
          name="comments"
          rows={4}
          maxLength={ON_BEHALF_COMMENTS_MAX}
          disabled={isPending}
          placeholder={t.approvals.onBehalf.commentsPlaceholder}
          className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={evidenceId}
          className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-ink-muted uppercase"
        >
          <PaperclipIcon className="size-3.5" />
          {t.approvals.decide.evidenceLabel}
        </label>
        <input
          id={evidenceId}
          type="file"
          name="evidence"
          accept={EVIDENCE_ACCEPT}
          disabled={isPending}
          className="block w-full text-xs text-ink-muted file:mr-3 file:rounded-lg file:border file:border-line file:bg-surface-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink-soft hover:file:bg-surface"
        />
        <p className="text-[11px] text-ink-muted">
          {t.approvals.onBehalf.evidenceHint}
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-xs text-danger-600">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-success-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-success-800 disabled:opacity-60"
      >
        {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
        {isPending
          ? t.approvals.onBehalf.submitting
          : t.approvals.onBehalf.submit}
      </button>
    </form>
  );
}
