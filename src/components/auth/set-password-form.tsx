"use client";

import Link from "next/link";
import { useActionState, useId } from "react";

import { PasswordField } from "@/components/ui/password-field";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import { completeAccountLinkAction } from "@/lib/auth/account-actions";
import {
  INITIAL_SET_PASSWORD_STATE,
  type AccountLinkPurpose,
} from "@/lib/auth/account-link-state";
import { useDictionary } from "@/i18n/provider";
import { submitKeepingValues } from "@/lib/forms/submit";

export function SetPasswordForm({
  purpose,
  token,
  userName,
}: {
  purpose: AccountLinkPurpose;
  token: string;
  userName: string;
}) {
  const t = useDictionary();
  const copy = purpose === "INVITE" ? t.accountLink.invite : t.accountLink.reset;
  const [state, formAction, isPending] = useActionState(
    completeAccountLinkAction,
    INITIAL_SET_PASSWORD_STATE,
  );
  const policiesId = useId();
  const policiesError = state.fieldErrors.acceptPolicies;

  return (
    <form onSubmit={submitKeepingValues(formAction)} className="space-y-5" noValidate>
      <input type="hidden" name="purpose" value={purpose} />
      <input type="hidden" name="token" value={token} />
      <input
        type="text"
        name="username"
        autoComplete="username"
        value={userName}
        readOnly
        hidden
      />

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

      <PasswordField
        name="password"
        label={t.accountLink.newLabel}
        error={state.fieldErrors.password}
        disabled={isPending}
        showChecklist
      />

      <PasswordField
        name="confirmPassword"
        label={t.accountLink.confirmLabel}
        error={state.fieldErrors.confirmPassword}
        disabled={isPending}
      />

      {purpose === "INVITE" ? (
        <div className="space-y-1.5">
          <div
            className={`flex items-start gap-3 rounded-lg border p-3.5 ${
              policiesError ? "border-danger-200 bg-danger-50" : "border-line"
            }`}
          >
            <input
              id={policiesId}
              name="acceptPolicies"
              type="checkbox"
              required
              disabled={isPending}
              aria-invalid={Boolean(policiesError)}
              aria-describedby={policiesError ? `${policiesId}-error` : undefined}
              className="mt-0.5 size-4 shrink-0 rounded border-line text-brand-600"
            />
            <label htmlFor={policiesId} className="text-sm text-ink-soft">
              {t.accountLink.policies.prefix}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener"
                className="font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
              >
                {t.accountLink.policies.link}
              </Link>
              {t.accountLink.policies.suffix}
            </label>
          </div>
          {policiesError ? (
            <p id={`${policiesId}-error`} className="text-xs text-danger-600">
              {policiesError}
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-600/60"
      >
        {isPending ? (
          <>
            <SpinnerIcon className="size-4 animate-spin" />
            {copy.submitting}
          </>
        ) : (
          copy.submit
        )}
      </button>
    </form>
  );
}
