"use client";

import { useActionState, useId, useState } from "react";

import { loginAction } from "@/lib/auth/actions";
import { useDictionary } from "@/i18n/provider";
import { INITIAL_LOGIN_STATE } from "@/lib/auth/login-state";
import {
  AlertIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  SpinnerIcon,
  UserIcon,
} from "@/components/icons";

const FIELD_BASE =
  "w-full rounded-lg border bg-white py-2.5 pl-10 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted";

function fieldClass(hasError: boolean, extraPadding = "pr-3") {
  const border = hasError
    ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
    : "border-line";
  return `${FIELD_BASE} ${border} ${extraPadding}`;
}

function formatLockout(
  lockedUntil: string,
  t: ReturnType<typeof useDictionary>,
): string | null {
  const until = new Date(lockedUntil);
  if (Number.isNaN(until.getTime())) return null;

  const minutes = Math.ceil((until.getTime() - Date.now()) / 60_000);
  if (minutes <= 0) return t.login.lockoutNow;
  if (minutes === 1) return t.login.lockoutOneMinute;
  return t.login.lockoutMinutes(minutes);
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    loginAction,
    INITIAL_LOGIN_STATE,
  );
  const [showPassword, setShowPassword] = useState(false);

  const usernameId = useId();
  const passwordId = useId();
  const errorId = useId();

  const isLocked = state.code === "ACCOUNT_LOCKED";
  const lockoutHint = state.lockedUntil
    ? formatLockout(state.lockedUntil, t)
    : null;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={nextPath} />

      {state.message ? (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          className={`flex gap-3 rounded-lg border p-3.5 text-sm ${
            isLocked
              ? "border-warn-200 bg-warn-50 text-warn-700"
              : "border-danger-200 bg-danger-50 text-danger-700"
          }`}
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">{state.message}</p>

            {state.remainingAttempts !== null && state.remainingAttempts > 0 ? (
              <p className="text-danger-600">
                {t.login.attemptsRemaining(state.remainingAttempts)}
              </p>
            ) : null}

            {lockoutHint ? <p className="text-warn-700/90">{lockoutHint}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor={usernameId}
          className="block text-sm font-medium text-ink-soft"
        >
          {t.login.usernameLabel}
        </label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            id={usernameId}
            name="username"
            type="text"
            autoComplete="username"
            defaultValue={state.username}
            disabled={isPending}
            aria-invalid={Boolean(state.fieldErrors.username)}
            aria-describedby={state.message ? errorId : undefined}
            placeholder={t.login.usernamePlaceholder}
            className={fieldClass(Boolean(state.fieldErrors.username))}
          />
        </div>
        {state.fieldErrors.username ? (
          <p className="text-xs text-danger-600">{state.fieldErrors.username}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={passwordId}
          className="block text-sm font-medium text-ink-soft"
        >
          {t.login.passwordLabel}
        </label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isPending}
            aria-invalid={Boolean(state.fieldErrors.password)}
            aria-describedby={state.message ? errorId : undefined}
            placeholder="••••••••"
            className={fieldClass(Boolean(state.fieldErrors.password), "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? t.password.hide : t.password.show}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-soft"
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
        {state.fieldErrors.password ? (
          <p className="text-xs text-danger-600">{state.fieldErrors.password}</p>
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
            {t.login.submitting}
          </>
        ) : (
          t.login.submit
        )}
      </button>
    </form>
  );
}
