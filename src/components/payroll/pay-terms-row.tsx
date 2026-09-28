"use client";

import { useActionState, useState } from "react";

import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { PayTermsFields } from "@/components/payroll/pay-terms-fields";
import { RateHistory } from "@/components/catalog/rate-history";
import { useConfirmedSubmit } from "@/components/ui/use-confirm";
import { useDictionary, useLocale } from "@/i18n/provider";
import { formatRate } from "@/lib/format/money";
import { updatePayTermsAction } from "@/lib/payroll/actions";
import {
  INITIAL_PAY_TERMS_ROW_STATE,
  type PayAssignment,
} from "@/lib/payroll/pay-terms";
import { submitKeepingValues } from "@/lib/forms/submit";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";

export function PayTermsRow({
  assignment,
  canEditRates,
}: {
  assignment: PayAssignment;
  canEditRates: boolean;
}) {
  const t = useDictionary();
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(
    updatePayTermsAction,
    INITIAL_PAY_TERMS_ROW_STATE,
  );
  const feedback = useFeedbackSlot();
  const { guard, dialog } = useConfirmedSubmit();
  const [dirty, setDirty] = useState(false);
  const [seenState, setSeenState] = useState(state);

  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "success") setDirty(false);
  }

  return (
    <li className="space-y-3 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">
            {assignment.consultant?.name ?? t.common.unknown}
            {assignment.isActive ? null : (
              <span className="ml-2 text-xs font-normal text-ink-muted">
                {t.payTermsPage.inactive}
              </span>
            )}
          </p>
          <p className="text-xs text-ink-muted">
            {assignment.project?.name ?? t.common.unknown}
            {assignment.client ? ` · ${assignment.client.name}` : ""}
            {assignment.assignmentCode ? ` · ${assignment.assignmentCode}` : ""}
          </p>
        </div>
        <dl className="flex gap-6 text-right">
          <div>
            <dt className="text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
              {t.payTermsPage.hourlyRate}
            </dt>
            <dd className="text-sm font-medium text-ink tabular-nums">
              {formatRate(assignment.hourlyRate, assignment.currency, locale)}
            </dd>
          </div>
        </dl>
      </div>

      <form
        key={state.savedAt ?? 0}
        onSubmit={submitKeepingValues(
          feedback.track(formAction),
          guard({
            title: t.confirmations.savePayTerms.title,
            body: t.confirmations.savePayTerms.body,
            confirmLabel: t.confirmations.savePayTerms.confirm,
          }),
        )}
        onChange={() => setDirty(true)}
        className="space-y-2"
        noValidate
      >
        {dialog}
        <input type="hidden" name="assignmentId" value={assignment.id} />
        <div className="flex items-end gap-2">
          <div className="w-40 space-y-1">
            <label
              htmlFor={`pay-rate-${assignment.id}`}
              className="block text-xs font-medium text-ink-soft"
            >
              {assignment.rateChanges.length
                ? t.catalog.rates.initial
                : t.payTermsPage.payRate}
            </label>
            <input
              id={`pay-rate-${assignment.id}`}
              name="payRate"
              type="text"
              inputMode="decimal"
              maxLength={13}
              defaultValue={assignment.payRate}
              disabled={isPending}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink tabular-nums focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted"
            />
          </div>
          <span className="pb-2 text-xs text-ink-muted">
            {assignment.currency} {t.rates.per[assignment.ratePeriod]}
          </span>
        </div>
        <PayTermsFields
          defaults={assignment.payTerms}
          disabled={isPending}
          collapsible
          ratePeriod={assignment.ratePeriod}
        />
        <div className="flex flex-wrap items-center justify-end gap-3">
          {feedback.visible && state.status === "error" && state.message ? (
            <p
              role="alert"
              className="flex items-center gap-2 text-xs text-danger-700"
            >
              <AlertIcon className="size-3.5 shrink-0" />
              {state.message}
            </p>
          ) : null}
          {feedback.visible && state.status === "success" && state.message ? (
            <p className="flex items-center gap-2 text-xs text-success-700">
              <CheckIcon className="size-3.5 shrink-0" />
              {state.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-60 ${
              dirty
                ? "animate-save-pulse bg-brand-600 hover:bg-brand-700"
                : "bg-brand-600/80 hover:bg-brand-700"
            }`}
          >
            {isPending ? (
              <SpinnerIcon className="size-3.5 animate-spin" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
            {t.payTermsPage.save}
          </button>
        </div>
      </form>

      {assignment.project ? (
        <div className="border-t border-line pt-3">
          <RateHistory
            projectId={assignment.project.id}
            assignmentId={assignment.id}
            consultantId={assignment.consultant?.id ?? null}
            startDate={assignment.startDate}
            endDate={assignment.endDate}
            currency={assignment.currency}
            payRate={assignment.payRate}
            ratePeriod={assignment.ratePeriod}
            rateChanges={assignment.rateChanges}
            editable={canEditRates && assignment.isActive}
          />
        </div>
      ) : null}
    </li>
  );
}
