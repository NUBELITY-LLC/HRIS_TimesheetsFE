"use client";

import Link from "next/link";
import { useActionState, useId } from "react";

import { AlertIcon, ArrowLeftIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { forgotPasswordAction } from "@/lib/auth/account-actions";
import { INITIAL_FORGOT_PASSWORD_STATE } from "@/lib/auth/account-link-state";
import { useDictionary } from "@/i18n/provider";
import { submitKeepingValues } from "@/lib/forms/submit";

export function ForgotPasswordForm() {
  const t = useDictionary();
  const emailId = useId();
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    INITIAL_FORGOT_PASSWORD_STATE,
  );

  const backLink = (
    <Link
      href="/login"
      className="flex w-fit items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink-soft"
    >
      <ArrowLeftIcon className="size-4" />
      {t.forgotPassword.backToLogin}
    </Link>
  );

  if (state.status === "sent") {
    return (
      <div className="space-y-6">
        <div
          role="status"
          aria-live="polite"
          className="flex gap-3 rounded-lg border border-success-200 bg-success-50 p-3.5 text-sm text-success-800"
        >
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">{t.forgotPassword.sentTitle}</p>
            <p className="text-success-700">{t.forgotPassword.sentBody(state.email)}</p>
          </div>
        </div>
        {backLink}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submitKeepingValues(formAction)} className="space-y-5" noValidate>
        {state.message ? (
          <div
            role="alert"
            aria-live="assertive"
            className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-sm text-danger-700"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            <p className="font-medium">{state.message}</p>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor={emailId} className="block text-sm font-medium text-ink-soft">
            {t.forgotPassword.emailLabel}
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            defaultValue={state.email}
            disabled={isPending}
            aria-invalid={Boolean(state.fieldError)}
            placeholder={t.forgotPassword.emailPlaceholder}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted ${
              state.fieldError
                ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
                : "border-line"
            }`}
          />
          {state.fieldError ? (
            <p className="text-xs text-danger-600">{state.fieldError}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-600/60"
        >
          {isPending ? (
            <>
              <SpinnerIcon className="size-4 animate-spin" />
              {t.forgotPassword.submitting}
            </>
          ) : (
            t.forgotPassword.submit
          )}
        </button>
      </form>
      {backLink}
    </div>
  );
}
