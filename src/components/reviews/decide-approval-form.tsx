"use client";

import { useActionState, useId, useState } from "react";

import { CheckIcon, PaperclipIcon, SpinnerIcon } from "@/components/icons";
import { useConfirmedSubmit } from "@/components/ui/use-confirm";
import { useDictionary } from "@/i18n/provider";
import { decideApprovalAction } from "@/lib/approvals/actions";
import {
  DECISION_COMMENTS_MAX,
  EVIDENCE_ACCEPT,
  INITIAL_DECIDE_APPROVAL_STATE,
} from "@/lib/approvals/form-state";
import { submitKeepingValues } from "@/lib/forms/submit";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";

export function DecideApprovalForm({
  approvalId,
  consultantName,
  nextApproverLabel,
  canReturnToPrevious,
}: {
  approvalId: number;
  consultantName: string;
  nextApproverLabel: string | null;
  canReturnToPrevious: boolean;
}) {
  const t = useDictionary();
  const commentsId = useId();
  const evidenceId = useId();
  const targetId = useId();
  const [state, formAction, isPending] = useActionState(
    decideApprovalAction,
    INITIAL_DECIDE_APPROVAL_STATE,
  );
  const feedback = useFeedbackSlot();
  const [mode, setMode] = useState<"approve" | "reject">("approve");
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

  const approving = mode === "approve";
  const approveLabel = nextApproverLabel
    ? t.approvals.decide.approveTo(nextApproverLabel)
    : t.approvals.decide.approveFinal;

  return (
    <form
      className="space-y-3"
      onSubmit={submitKeepingValues(feedback.track(formAction), guard(
        approving
          ? {
              title: t.approvals.decide.confirmApprove(consultantName),
              body: nextApproverLabel
                ? t.approvals.decide.confirmApproveBody(nextApproverLabel)
                : t.approvals.decide.confirmApproveFinalBody,
              confirmLabel: approveLabel,
              tone: "default",
            }
          : null,
      ))}
    >
      {dialog}
      <input type="hidden" name="approvalId" value={approvalId} />
      <input
        type="hidden"
        name="decision"
        value={approving ? "APPROVE" : "REJECT"}
      />

      <div
        role="radiogroup"
        aria-label={t.approvals.decide.modeLabel}
        className="flex gap-2 rounded-lg bg-surface-muted p-1"
      >
        <button
          type="button"
          role="radio"
          aria-checked={approving}
          onClick={() => setMode("approve")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            approving
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {t.approvals.decide.approve}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!approving}
          onClick={() => setMode("reject")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            approving
              ? "text-ink-muted hover:text-ink"
              : "bg-surface text-ink shadow-sm"
          }`}
        >
          {t.approvals.decide.reject}
        </button>
      </div>

      {approving ? null : (
        <fieldset className="space-y-1.5">
          <legend className="block text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
            {t.approvals.decide.targetLabel}
          </legend>
          <label
            htmlFor={targetId}
            className="flex items-start gap-2 text-xs text-ink-soft"
          >
            <input
              id={targetId}
              type="radio"
              name="target"
              value="CONSULTANT"
              defaultChecked
              disabled={isPending}
              className="mt-0.5"
            />
            {t.approvals.decide.targetConsultant}
          </label>
          {canReturnToPrevious ? (
            <label className="flex items-start gap-2 text-xs text-ink-soft">
              <input
                type="radio"
                name="target"
                value="PREVIOUS"
                disabled={isPending}
                className="mt-0.5"
              />
              {t.approvals.decide.targetPrevious}
            </label>
          ) : null}
        </fieldset>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor={commentsId}
          className="block text-[10px] font-semibold tracking-wide text-ink-muted uppercase"
        >
          {approving
            ? t.approvals.decide.approveCommentsLabel
            : t.approvals.decide.rejectCommentsLabel}
        </label>
        <textarea
          id={commentsId}
          name="comments"
          rows={4}
          required={!approving}
          maxLength={DECISION_COMMENTS_MAX}
          disabled={isPending}
          placeholder={
            approving
              ? t.approvals.decide.approveCommentsPlaceholder
              : t.approvals.decide.rejectCommentsPlaceholder
          }
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
          {t.approvals.decide.evidenceHint}
        </p>
      </div>

      {feedback.visible && state.status === "error" && state.message ? (
        <p role="alert" className="text-xs text-danger-600">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={
          approving
            ? "flex w-full items-center justify-center gap-2 rounded-lg bg-success-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-success-800 disabled:opacity-60"
            : "flex w-full items-center justify-center gap-2 rounded-lg bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger-700 disabled:opacity-60"
        }
      >
        {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
        {isPending
          ? approving
            ? t.approvals.decide.approving
            : t.approvals.decide.rejecting
          : approving
            ? approveLabel
            : t.approvals.decide.rejectToConsultant}
      </button>
    </form>
  );
}
