"use client";

import Link from "next/link";
import { useActionState, useId } from "react";

import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { saveCompanyAction } from "@/lib/catalog/actions";
import {
  EMPTY_COMPANY_FORM_VALUES,
  INITIAL_COMPANY_FORM_STATE,
  type CompanyFormValues,
} from "@/lib/catalog/form-state";
import { submitKeepingValues } from "@/lib/forms/submit";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";
import { useConfirmedSubmit } from "@/components/ui/use-confirm";

const INPUT_BASE =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";

function inputClass(hasError: boolean): string {
  return `${INPUT_BASE} ${
    hasError
      ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
      : "border-line"
  }`;
}

export function CompanyForm({
  mode,
  companyId,
  defaultValues = EMPTY_COMPANY_FORM_VALUES,
}: {
  mode: "create" | "edit";
  companyId?: number;
  defaultValues?: CompanyFormValues;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(saveCompanyAction, {
    ...INITIAL_COMPANY_FORM_STATE,
    values: defaultValues,
  });
  const feedback = useFeedbackSlot();
  const { guard: confirmGuard, dialog: confirmDialog } = useConfirmedSubmit();

  const ids = {
    legalName: useId(),
    tradeName: useId(),
    rfc: useId(),
    isActive: useId(),
  };
  const { fieldErrors, values } = state;
  const isCreate = mode === "create";
  const formKey = isCreate ? (state.savedName ?? "new") : "edit";

  return (
    <form onSubmit={submitKeepingValues(
        feedback.track(formAction),
        confirmGuard({
          title: isCreate
            ? t.confirmations.createCompany.title
            : t.confirmations.saveCompany.title,
          confirmLabel: isCreate
            ? t.confirmations.createCompany.confirm
            : t.confirmations.saveCompany.confirm,
        }),
      )} className="space-y-5" noValidate>
      {confirmDialog}
      {companyId ? <input type="hidden" name="id" value={companyId} /> : null}

      {feedback.visible && state.status === "success" && state.savedName ? (
        <div
          role="status"
          aria-live="polite"
          className="flex gap-3 rounded-lg border border-success-200 bg-success-50 p-3.5 text-sm text-success-800"
        >
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">
              {isCreate
                ? t.catalog.companies.createdTitle(state.savedName)
                : t.catalog.companies.updatedTitle(state.savedName)}
            </p>
            <Link
              href="/companies"
              className="font-medium text-success-700 underline underline-offset-2"
            >
              {t.catalog.companies.back}
            </Link>
          </div>
        </div>
      ) : null}

      {feedback.visible && state.status === "error" && state.message ? (
        <div
          role="alert"
          aria-live="assertive"
          className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      <div key={formKey} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor={ids.legalName}
            className="block text-sm font-medium text-ink-soft"
          >
            {t.catalog.form.legalName}
          </label>
          <input
            id={ids.legalName}
            name="legalName"
            type="text"
            maxLength={200}
            required
            defaultValue={values.legalName}
            placeholder={t.catalog.form.legalNamePlaceholder}
            className={inputClass(Boolean(fieldErrors.legalName))}
          />
          {fieldErrors.legalName ? (
            <p className="text-xs text-danger-600">{fieldErrors.legalName}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={ids.tradeName}
            className="block text-sm font-medium text-ink-soft"
          >
            {t.catalog.form.tradeName}
          </label>
          <input
            id={ids.tradeName}
            name="tradeName"
            type="text"
            maxLength={150}
            required
            defaultValue={values.tradeName}
            placeholder={t.catalog.form.tradeNamePlaceholder}
            className={inputClass(Boolean(fieldErrors.tradeName))}
          />
          {fieldErrors.tradeName ? (
            <p className="text-xs text-danger-600">{fieldErrors.tradeName}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.rfc} className="block text-sm font-medium text-ink-soft">
            {t.catalog.form.rfc}
          </label>
          <input
            id={ids.rfc}
            name="rfc"
            type="text"
            maxLength={13}
            defaultValue={values.rfc}
            className={`${inputClass(Boolean(fieldErrors.rfc))} uppercase`}
          />
          {fieldErrors.rfc ? (
            <p className="text-xs text-danger-600">{fieldErrors.rfc}</p>
          ) : (
            <p className="text-xs text-ink-muted">{t.catalog.form.rfcHint}</p>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-line p-3.5">
          <input
            id={ids.isActive}
            name="isActive"
            type="checkbox"
            defaultChecked={values.isActive}
            className="mt-0.5 size-4 rounded border-line text-brand-600"
          />
          <label htmlFor={ids.isActive} className="text-sm font-medium text-ink">
            {t.catalog.form.companyActiveTitle}
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
        {isPending
          ? isCreate
            ? t.catalog.form.creating
            : t.catalog.form.saving
          : isCreate
            ? t.catalog.form.create
            : t.catalog.form.save}
      </button>
    </form>
  );
}
