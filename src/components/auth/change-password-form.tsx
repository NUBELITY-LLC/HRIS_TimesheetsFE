"use client";

import { useActionState, useId } from "react";

import { PasswordField } from "@/components/ui/password-field";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import { changePasswordAction } from "@/lib/auth/actions";
import { INITIAL_CHANGE_PASSWORD_STATE } from "@/lib/auth/change-password-state";
import { useDictionary } from "@/i18n/provider";

export function ChangePasswordForm({
  nextPath,
  forced,
}: {
  nextPath: string;
  forced: boolean;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    INITIAL_CHANGE_PASSWORD_STATE,
  );
  const errorId = useId();

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={nextPath} />

      {state.message ? (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      {forced ? null : (
        <PasswordField
          name="currentPassword"
          label={t.changePassword.currentLabel}
          autoComplete="current-password"
          error={state.fieldErrors.currentPassword}
          disabled={isPending}
        />
      )}

      <PasswordField
        name="newPassword"
        label={t.changePassword.newLabel}
        error={state.fieldErrors.newPassword}
        disabled={isPending}
        showChecklist
      />

      <PasswordField
        name="confirmPassword"
        label={t.changePassword.confirmLabel}
        error={state.fieldErrors.confirmPassword}
        disabled={isPending}
      />

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-600/60"
      >
        {isPending ? (
          <>
            <SpinnerIcon className="size-4 animate-spin" />
            {t.changePassword.submitting}
          </>
        ) : (
          t.changePassword.submit
        )}
      </button>
    </form>
  );
}
