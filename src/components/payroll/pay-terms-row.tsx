"use client";

import { useActionState } from "react";

import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { PayTermsFields } from "@/components/payroll/pay-terms-fields";
import { useDictionary, useLocale } from "@/i18n/provider";
import { formatRate } from "@/lib/format/money";
import { updatePayTermsAction } from "@/lib/payroll/actions";
import {
  INITIAL_PAY_TERMS_ROW_STATE,
  type PayAssignment,
} from "@/lib/payroll/pay-terms";
import { submitKeepingValues } from "@/lib/forms/submit";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";

export function PayTermsRow({ assignment }: { assignment: PayAssignment }) {
  const t = useDictionary();
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(
    updatePayTermsAction,
    INITIAL_PAY_TERMS_ROW_STATE,
  );
  const feedback = useFeedbackSlot();

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
        onSubmit={submitKeepingValues(feedback.track(formAction))}
        className="space-y-2"
        noValidate
      >
        <input type="hidden" name="assignmentId" value={assignment.id} />
        <div className="flex items-end gap-2">
          <div className="w-40 space-y-1">
            <label
              htmlFor={`pay-rate-${assignment.id}`}
              className="block text-xs font-medium text-ink-soft"
            >
              {t.payTermsPage.payRate}
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
            className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            {isPending ? (
              <SpinnerIcon className="size-3.5 animate-spin" />
            ) : null}
            {t.payTermsPage.save}
          </button>
        </div>
      </form>
    </li>
  );
}
