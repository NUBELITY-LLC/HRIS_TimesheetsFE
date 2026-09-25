"use client";

import { useActionState, useId } from "react";

import {
  AlertIcon,
  CheckIcon,
  PlusIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/components/icons";
import { useConfirmedSubmit } from "@/components/ui/use-confirm";
import { useDictionary } from "@/i18n/provider";
import { addHolidayAction, removeHolidayAction } from "@/lib/holidays/actions";
import { INITIAL_HOLIDAY_FORM_STATE } from "@/lib/holidays/types";

const INPUT_CLASS =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted";

function border(hasError: boolean): string {
  return hasError
    ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
    : "border-line";
}

export function AddHolidayForm({
  countryCode,
  year,
}: {
  countryCode: string;
  year: number;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    addHolidayAction,
    INITIAL_HOLIDAY_FORM_STATE,
  );
  const ids = { date: useId(), name: useId() };
  const { fieldErrors } = state;

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-line bg-surface p-4"
      noValidate
    >
      <input type="hidden" name="countryCode" value={countryCode} />
      <div key={state.savedAt ?? 0} className="flex flex-wrap items-end gap-3">
        <div className="w-44 space-y-1.5">
          <label htmlFor={ids.date} className="block text-xs font-medium text-ink-soft">
            {t.holidays.date}
          </label>
          <input
            id={ids.date}
            name="date"
            type="date"
            min={`${year}-01-01`}
            max={`${year}-12-31`}
            disabled={isPending}
            className={`${INPUT_CLASS} ${border(Boolean(fieldErrors.date))}`}
          />
        </div>
        <div className="min-w-56 flex-1 space-y-1.5">
          <label htmlFor={ids.name} className="block text-xs font-medium text-ink-soft">
            {t.holidays.name}
          </label>
          <input
            id={ids.name}
            name="name"
            type="text"
            maxLength={120}
            placeholder={t.holidays.namePlaceholder}
            disabled={isPending}
            className={`${INPUT_CLASS} ${border(Boolean(fieldErrors.name))}`}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? (
            <SpinnerIcon className="size-4 animate-spin" />
          ) : (
            <PlusIcon className="size-4" />
          )}
          {isPending ? t.holidays.adding : t.holidays.add}
        </button>
      </div>

      {[fieldErrors.date, fieldErrors.name]
        .filter((error): error is string => Boolean(error))
        .map((error) => (
          <p key={error} className="text-xs text-danger-600">
            {error}
          </p>
        ))}

      {state.status === "error" && state.message ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-danger-700">
          <AlertIcon className="size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}

      {state.status === "success" && state.message ? (
        <p className="flex items-center gap-2 text-sm text-success-700">
          <CheckIcon className="size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function RemoveHolidayButton({ id, name }: { id: number; name: string }) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    removeHolidayAction,
    INITIAL_HOLIDAY_FORM_STATE,
  );
  const { guard, dialog } = useConfirmedSubmit();

  return (
    <form
      action={formAction}
      onSubmit={guard({
        title: t.holidays.confirmRemove(name),
        confirmLabel: t.holidays.remove,
        tone: "danger",
      })}
    >
      {dialog}
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        title={
          state.status === "error"
            ? (state.message ?? undefined)
            : t.holidays.remove
        }
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-danger-600 transition-colors hover:bg-danger-50 disabled:opacity-60"
      >
        {isPending ? (
          <SpinnerIcon className="size-3.5 animate-spin" />
        ) : (
          <TrashIcon className="size-3.5" />
        )}
        {t.holidays.remove}
      </button>
    </form>
  );
}
