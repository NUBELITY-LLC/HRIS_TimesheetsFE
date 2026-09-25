"use client";

import { useActionState, useId } from "react";

import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { savePayrollRulesAction } from "@/lib/payroll/actions";
import {
  INITIAL_PAYROLL_RULES_FORM_STATE,
  sundayPremiumPercent,
  type PayrollRules,
  type PayrollRulesField,
} from "@/lib/payroll/pay-terms";

const INPUT_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink tabular-nums transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted";

const FIELDS: PayrollRulesField[] = [
  "overtimeMultiplier",
  "weeklyDoubleOvertimeHours",
  "overtimeTripleMultiplier",
  "holidayMultiplier",
  "sundayPremiumPercent",
];

function initialValue(rules: PayrollRules, field: PayrollRulesField): string {
  if (field === "sundayPremiumPercent") {
    return String(sundayPremiumPercent(rules.sundayMultiplier));
  }
  const value = rules[field];
  return value === null ? "" : String(value);
}

export function PayrollRulesForm({ rules }: { rules: PayrollRules }) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    savePayrollRulesAction,
    INITIAL_PAYROLL_RULES_FORM_STATE,
  );
  const baseId = useId();

  return (
    <form
      key={state.values ? JSON.stringify(state.values) : "saved"}
      action={formAction}
      className="space-y-5"
      noValidate
    >
      <input type="hidden" name="countryCode" value={rules.countryCode} />

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field} className="space-y-1.5">
            <label
              htmlFor={`${baseId}-${field}`}
              className="block text-sm font-medium text-ink-soft"
            >
              {t.payrollRules[field]}
            </label>
            <input
              id={`${baseId}-${field}`}
              name={field}
              type="text"
              inputMode="decimal"
              maxLength={6}
              defaultValue={state.values?.[field] ?? initialValue(rules, field)}
              disabled={isPending}
              className={INPUT_CLASS}
            />
            {field === "weeklyDoubleOvertimeHours" ? (
              <p className="text-xs text-ink-muted">
                {t.payrollRules.weeklyDoubleOvertimeHoursHint}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-danger-700"
        >
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

      <div className="flex justify-end border-t border-line pt-5">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
          {isPending ? t.payrollRules.saving : t.payrollRules.save}
        </button>
      </div>
    </form>
  );
}
