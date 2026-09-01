"use server";

import { redirect } from "next/navigation";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import { translateFieldMessage } from "@/lib/api/messages";
import {
  readAttemptDetails,
  readValidationIssues,
  type LoginResult,
} from "@/lib/api/types";
import { getDictionary } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  createSession,
  destroySession,
  getSessionToken,
  requireUser,
} from "./session";
import { INITIAL_LOGIN_STATE, type LoginFormState } from "./login-state";
import { passwordPolicyError } from "./password-policy";
import type {
  ChangePasswordField,
  ChangePasswordFormState,
} from "./change-password-state";

const DEFAULT_REDIRECT = "/dashboard";

function safeNextPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("")) return DEFAULT_REDIRECT;
  return value;
}

function loginErrorCopy(code: string, t: Dictionary): string | undefined {
  const copy = t.login.errors as Record<string, string>;
  return copy[code];
}

function mapFieldErrors(
  details: unknown,
  t: Dictionary,
): LoginFormState["fieldErrors"] {
  const fieldErrors: LoginFormState["fieldErrors"] = {};

  for (const issue of readValidationIssues(details)) {
    const message = translateFieldMessage(issue.message, t);
    if (issue.path === "username") fieldErrors.username = message;
    if (issue.path === "password") fieldErrors.password = message;
  }

  return fieldErrors;
}

function toFormState(
  result: Extract<ApiResult<LoginResult>, { ok: false }>,
  username: string,
  t: Dictionary,
): LoginFormState {
  const { code, message, details } = result.error;
  const { remainingAttempts, lockedUntil } = readAttemptDetails(details);

  return {
    message: loginErrorCopy(code, t) ?? message ?? t.login.errors.fallback,
    code,
    remainingAttempts: remainingAttempts ?? null,
    lockedUntil: lockedUntil ?? null,
    fieldErrors: code === "BAD_REQUEST" ? mapFieldErrors(details, t) : {},
    username,
  };
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const t = await getDictionary();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(String(formData.get("next") ?? ""));

  const fieldErrors: LoginFormState["fieldErrors"] = {};
  if (!username) fieldErrors.username = t.login.usernameRequired;
  if (!password) fieldErrors.password = t.login.passwordRequired;

  if (fieldErrors.username || fieldErrors.password) {
    return {
      ...INITIAL_LOGIN_STATE,
      message: t.login.missingFields,
      code: "MISSING_FIELDS",
      fieldErrors,
      username,
    };
  }

  const result = await apiRequest<LoginResult>("/auth/login", {
    method: "POST",
    body: { username, password },
  });

  if (!result.ok) {
    return toFormState(result, username, t);
  }

  await createSession(result.data.accessToken, result.data.expiresIn);

  if (result.data.user.mustChangePassword) {
    redirect(`/change-password?next=${encodeURIComponent(nextPath)}`);
  }

  redirect(nextPath);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

function isChangePasswordField(path: string): path is ChangePasswordField {
  return path === "currentPassword" || path === "newPassword";
}

export async function changePasswordAction(
  _prevState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  const t = await getDictionary();
  const user = await requireUser();
  const forced = user.mustChangePassword;

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const nextPath = safeNextPath(String(formData.get("next") ?? ""));

  const fieldErrors: ChangePasswordFormState["fieldErrors"] = {};

  if (!forced && !currentPassword) {
    fieldErrors.currentPassword = t.changePassword.currentRequired;
  }

  const policyError = passwordPolicyError(newPassword, t);
  if (policyError) {
    fieldErrors.newPassword = policyError;
  } else if (!forced && newPassword === currentPassword) {
    fieldErrors.newPassword = t.changePassword.sameAsCurrent;
  }

  if (!fieldErrors.newPassword && newPassword !== confirmPassword) {
    fieldErrors.confirmPassword = t.changePassword.mismatch;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: t.changePassword.reviewFields,
      code: "WEAK_PASSWORD",
      fieldErrors,
    };
  }

  const token = await getSessionToken();
  const result = await apiRequest<LoginResult>("/auth/change-password", {
    method: "POST",
    token,
    body: forced ? { newPassword } : { currentPassword, newPassword },
  });

  if (!result.ok) {
    const { code, message, details } = result.error;

    if (result.status === 401 && code !== "INVALID_CURRENT_PASSWORD") {
      redirect("/login?reason=session_expired");
    }

    const nextFieldErrors: ChangePasswordFormState["fieldErrors"] = {};
    if (code === "BAD_REQUEST") {
      for (const issue of readValidationIssues(details)) {
        if (isChangePasswordField(issue.path)) {
          nextFieldErrors[issue.path] = translateFieldMessage(issue.message, t);
        }
      }
    }
    if (code === "INVALID_CURRENT_PASSWORD" || code === "CURRENT_PASSWORD_REQUIRED") {
      nextFieldErrors.currentPassword = t.changePassword.errors[code];
    }
    if (code === "PASSWORD_NOT_CHANGED") {
      nextFieldErrors.newPassword = t.changePassword.errors.PASSWORD_NOT_CHANGED;
    }

    const copy = t.changePassword.errors as Record<string, string>;

    return {
      message:
        Object.keys(nextFieldErrors).length > 0
          ? t.changePassword.reviewFields
          : (copy[code] ?? message ?? t.changePassword.errors.fallback),
      code,
      fieldErrors: nextFieldErrors,
    };
  }

  await createSession(result.data.accessToken, result.data.expiresIn);

  redirect(nextPath);
}
