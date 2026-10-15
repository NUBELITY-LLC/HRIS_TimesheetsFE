"use server";

import { redirect } from "next/navigation";

import { apiRequest } from "@/lib/api/client";
import { translateFieldMessage } from "@/lib/api/messages";
import { readValidationIssues, type LoginResult } from "@/lib/api/types";
import { isLocale } from "@/i18n/config";
import { getDictionary, storeLocale } from "@/i18n/server";
import { createSession } from "./session";
import { passwordPolicyError } from "./password-policy";
import {
  ACCOUNT_LINK_ENDPOINTS,
  type AccountLinkPurpose,
  type ForgotPasswordFormState,
  type SetPasswordFormState,
} from "./account-link-state";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readPurpose(value: FormDataEntryValue | null): AccountLinkPurpose {
  return value === "RESET" ? "RESET" : "INVITE";
}

export async function completeAccountLinkAction(
  _prevState: SetPasswordFormState,
  formData: FormData,
): Promise<SetPasswordFormState> {
  const t = await getDictionary();
  const purpose = readPurpose(formData.get("purpose"));
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: SetPasswordFormState["fieldErrors"] = {};
  const policyError = passwordPolicyError(password, t);

  if (policyError) fieldErrors.password = policyError;
  else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = t.accountLink.mismatch;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: t.accountLink.reviewFields, code: "BAD_REQUEST", fieldErrors };
  }

  const result = await apiRequest<LoginResult>(
    ACCOUNT_LINK_ENDPOINTS[purpose].complete(token),
    { method: "POST", body: { password } },
  );

  if (!result.ok) {
    const { code, message, details } = result.error;

    if (result.status === 404) {
      const copy = purpose === "INVITE" ? t.accountLink.invite : t.accountLink.reset;
      return { message: copy.invalidBody, code, fieldErrors: {} };
    }

    if (code === "BAD_REQUEST") {
      const issues: SetPasswordFormState["fieldErrors"] = {};
      for (const issue of readValidationIssues(details)) {
        if (issue.path === "password") {
          issues.password = translateFieldMessage(issue.message, t);
        }
      }
      return { message: t.accountLink.reviewFields, code, fieldErrors: issues };
    }

    const copy = t.accountLink.errors as Record<string, string>;
    return {
      message: copy[code] ?? message ?? t.accountLink.errors.fallback,
      code,
      fieldErrors: {},
    };
  }

  await createSession(result.data.accessToken, result.data.expiresIn);

  if (isLocale(result.data.user.locale)) {
    await storeLocale(result.data.user.locale);
  }

  redirect("/dashboard");
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const t = await getDictionary();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { status: "error", message: null, email, fieldError: t.forgotPassword.emailRequired };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: null, email, fieldError: t.forgotPassword.emailInvalid };
  }

  const result = await apiRequest<{ requested: boolean }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

  if (!result.ok && result.status !== 400) {
    const copy = t.forgotPassword.errors as Record<string, string>;
    return {
      status: "error",
      message: copy[result.error.code] ?? t.forgotPassword.errors.fallback,
      email,
      fieldError: null,
    };
  }

  return { status: "sent", message: null, email, fieldError: null };
}
