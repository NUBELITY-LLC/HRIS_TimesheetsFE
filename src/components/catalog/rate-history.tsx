"use client";

import { useActionState, useId, useState } from "react";

import { PlusIcon, SpinnerIcon, TrashIcon } from "@/components/icons";
import { RatePeriodSelect } from "@/components/rates/rate-selects";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";
import { useConfirmedSubmit } from "@/components/ui/use-confirm";
import { useDictionary, useLocale } from "@/i18n/provider";
import {
  addRateChangeAction,
  removeRateChangeAction,
} from "@/lib/catalog/actions";
import { INITIAL_ASSIGNMENT_ROW_STATE } from "@/lib/catalog/form-state";
import { formatProjectDate } from "@/lib/catalog/lifecycle";
import type { RateChangeView } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/format/money";
import { submitKeepingValues } from "@/lib/forms/submit";
import type { RatePeriod } from "@/lib/rates/rates";
import { toISODate } from "@/lib/timesheets/week";

const INPUT_CLASS =
  "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted disabled:text-ink-muted";

const LABEL_CLASS =
  "block text-[10px] font-semibold tracking-wide text-ink-muted uppercase";

export type RateHistoryProps = {
  projectId: number;
  assignmentId: number;
  consultantId: number | null;
  startDate: string;
  endDate: string | null;
  currency: string;
  payRate: number;
  ratePeriod: RatePeriod;
  rateChanges: RateChangeView[];
  editable: boolean;
};

type RateEntry = {
  key: string;
  id: number | null;
  effectiveFrom: string;
  payRate: number;
  ratePeriod: RatePeriod;
};

export function rateEntries(
  props: Pick<RateHistoryProps, "startDate" | "payRate" | "ratePeriod" | "rateChanges">,
): { entries: RateEntry[]; current: RateEntry } {
  const entries: RateEntry[] = [
    {
      key: "initial",
      id: null,
      effectiveFrom: props.startDate,
      payRate: props.payRate,
      ratePeriod: props.ratePeriod,
    },
    ...props.rateChanges.map((change) => ({
      key: `change-${change.id}`,
      id: change.id,
      effectiveFrom: change.effectiveFrom,
      payRate: change.payRate,
      ratePeriod: change.ratePeriod,
    })),
  ];
  const today = toISODate(new Date());
  const current =
    [...entries].reverse().find((entry) => entry.effectiveFrom <= today) ??
    entries[0]!;

  return { entries, current };
}

function HiddenIds({
  projectId,
  assignmentId,
  consultantId,
}: Pick<RateHistoryProps, "projectId" | "assignmentId" | "consultantId">) {
  return (
    <>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="assignmentId" value={assignmentId} />
      {consultantId ? (
        <input type="hidden" name="consultantId" value={consultantId} />
      ) : null}
    </>
  );
}

function RemoveRateChange({
  rateId,
  ...ids
}: Pick<RateHistoryProps, "projectId" | "assignmentId" | "consultantId"> & {
  rateId: number;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    removeRateChangeAction,
    INITIAL_ASSIGNMENT_ROW_STATE,
  );
  const feedback = useFeedbackSlot();
  const { guard, dialog } = useConfirmedSubmit();

  return (
    <form
      onSubmit={submitKeepingValues(
        feedback.track(formAction),
        guard({
          title: t.confirmations.removeRateChange.title,
          body: t.confirmations.removeRateChange.body,
          confirmLabel: t.confirmations.removeRateChange.confirm,
          tone: "danger",
        }),
      )}
      className="flex items-center gap-2"
    >
      {dialog}
      <HiddenIds {...ids} />
      <input type="hidden" name="rateId" value={rateId} />
      {feedback.visible && state.status === "error" && state.message ? (
        <span className="text-xs text-danger-600">{state.message}</span>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        title={t.catalog.rates.remove}
        aria-label={t.catalog.rates.remove}
        className="grid size-7 place-items-center rounded-md text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
      >
        {isPending ? (
          <SpinnerIcon className="size-3.5 animate-spin" />
        ) : (
          <TrashIcon className="size-3.5" />
        )}
      </button>
    </form>
  );
}

export function RateHistory(props: RateHistoryProps) {
  const { projectId, assignmentId, consultantId, currency, editable } = props;
  const t = useDictionary();
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(
    addRateChangeAction,
    INITIAL_ASSIGNMENT_ROW_STATE,
  );
  const feedback = useFeedbackSlot();
  const { guard, dialog } = useConfirmedSubmit();
  const [seenState, setSeenState] = useState(state);
  const [formKey, setFormKey] = useState(0);
  const ids = { effectiveFrom: useId(), payRate: useId() };

  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "success") setFormKey((current) => current + 1);
  }

  const { entries, current } = rateEntries(props);

  const describe = (entry: RateEntry) =>
    `${formatMoney(entry.payRate, currency, locale)} ${t.rates.per[entry.ratePeriod]}`;

  return (
    <details className="group rounded-lg border border-line px-3 py-2">
      <summary className="cursor-pointer text-xs font-medium text-ink-soft select-none">
        {t.catalog.rates.title} · {t.catalog.rates.current}: {describe(current)}
      </summary>

      <div className="space-y-3 pt-3 pb-1">
        <ul className="space-y-1.5 text-xs">
          {entries.map((entry) => (
            <li
              key={entry.key}
              className="flex items-center justify-between gap-3"
            >
              <span
                className={
                  entry === current ? "font-semibold text-ink" : "text-ink-soft"
                }
              >
                {describe(entry)} ·{" "}
                {entry.id === null
                  ? t.catalog.rates.initial.toLowerCase()
                  : t.catalog.rates.since(
                      formatProjectDate(
                        entry.effectiveFrom,
                        locale,
                        entry.effectiveFrom,
                      ),
                    )}
              </span>
              {entry.id !== null && editable ? (
                <RemoveRateChange
                  projectId={projectId}
                  assignmentId={assignmentId}
                  consultantId={consultantId}
                  rateId={entry.id}
                />
              ) : null}
            </li>
          ))}
        </ul>

        {editable ? (
          <form
            key={formKey}
            onSubmit={submitKeepingValues(
              feedback.track(formAction),
              guard({
                title: t.confirmations.addRateChange.title,
                body: t.confirmations.addRateChange.body,
                confirmLabel: t.confirmations.addRateChange.confirm,
              }),
            )}
            className="flex flex-wrap items-end gap-2"
            noValidate
          >
            {dialog}
            <HiddenIds
              projectId={projectId}
              assignmentId={assignmentId}
              consultantId={consultantId}
            />

            <div className="space-y-1">
              <label htmlFor={ids.effectiveFrom} className={LABEL_CLASS}>
                {t.catalog.rates.effectiveFrom}
              </label>
              <input
                id={ids.effectiveFrom}
                name="effectiveFrom"
                type="date"
                min={props.startDate}
                max={props.endDate ?? undefined}
                disabled={isPending}
                className={`w-40 ${INPUT_CLASS}`}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={ids.payRate} className={LABEL_CLASS}>
                {t.catalog.rates.newCost}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id={ids.payRate}
                  name="payRate"
                  type="text"
                  inputMode="decimal"
                  maxLength={13}
                  placeholder="0"
                  disabled={isPending}
                  className={`w-28 tabular-nums ${INPUT_CLASS}`}
                />
                <span className="text-xs text-ink-muted">{currency}</span>
                <RatePeriodSelect
                  defaultValue={current.ratePeriod}
                  disabled={isPending}
                  className={`w-28 ${INPUT_CLASS}`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-50"
            >
              {isPending ? (
                <SpinnerIcon className="size-3.5 animate-spin" />
              ) : (
                <PlusIcon className="size-3.5" />
              )}
              {t.catalog.rates.add}
            </button>
          </form>
        ) : null}

        {feedback.visible && state.status === "error" && state.message ? (
          <p role="alert" className="text-xs text-danger-600">
            {state.message}
          </p>
        ) : null}
        {feedback.visible && state.status === "success" && state.message ? (
          <p className="text-xs text-success-700">{state.message}</p>
        ) : null}

        <p className="text-[11px] text-ink-muted">
          {t.catalog.rates.frozenHint}
        </p>
      </div>
    </details>
  );
}
