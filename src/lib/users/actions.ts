"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import { translateFieldMessage } from "@/lib/api/messages";
import { readValidationIssues, type UserView } from "@/lib/api/types";
import { passwordPolicyError } from "@/lib/auth/password-policy";
import { getSessionToken, requireUser } from "@/lib/auth/session";
import { getDictionary } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import { canManageUsers, manageableRoleCodes, roleName } from "./roles";
import {
  EMPTY_USER_FORM_VALUES,
  type RowActionState,
  type UserFormField,
  type UserFormState,
  type UserFormValues,
} from "./form-state";

const FIELD_NAMES: UserFormField[] = [
  "fullName",
  "userName",
  "email",
  "password",
  "roleCode",
  "jobTitle",
];

function readValues(formData: FormData): UserFormValues {
  return {
    fullName: String(formData.get("fullName") ?? "").trim(),
    userName: String(formData.get("userName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    roleCode: String(formData.get("roleCode") ?? "").trim(),
    jobTitle: String(formData.get("jobTitle") ?? "").trim(),
    isActive: formData.get("isActive") !== null,
  };
}

function isField(path: string): path is UserFormField {
  return (FIELD_NAMES as string[]).includes(path);
}

function conflictField(message: string): "email" | "userName" | null {
  const normalized = message.toLowerCase();
  if (normalized.includes("correo")) return "email";
  if (normalized.includes("nombre de usuario")) return "userName";
  return null;
}

function errorCopy(code: string, t: Dictionary): string | undefined {
  return (t.users.errors as Record<string, unknown>)[code] as string | undefined;
}

function allowedRolesHint(
  details: unknown,
  actorRoleCode: string,
  t: Dictionary,
): string {
  let codes: string[];

  if (
    typeof details === "object" &&
    details !== null &&
    "allowedRoles" in details &&
    Array.isArray((details as { allowedRoles: unknown }).allowedRoles)
  ) {
    codes = (details as { allowedRoles: unknown[] }).allowedRoles.filter(
      (code): code is string => typeof code === "string",
    );
  } else {
    codes = manageableRoleCodes(actorRoleCode);
  }

  if (codes.length === 0) return "";
  return t.users.errors.allowedRoles(
    codes.map((code) => roleName(code, t)).join(", "),
  );
}

function toErrorState(
  result: Extract<ApiResult<{ user: UserView }>, { ok: false }>,
  values: UserFormValues,
  actorRoleCode: string,
  t: Dictionary,
): UserFormState {
  const { code, message, details } = result.error;
  const fieldErrors: UserFormState["fieldErrors"] = {};

  if (code === "BAD_REQUEST") {
    for (const issue of readValidationIssues(details)) {
      if (isField(issue.path)) {
        fieldErrors[issue.path] = translateFieldMessage(issue.message, t);
      }
    }
  }

  let conflictCopy: string | null = null;
  if (code === "CONFLICT") {
    const field = conflictField(message);
    if (field === "email") {
      conflictCopy = t.users.errors.conflictEmail;
      fieldErrors.email = conflictCopy;
    } else if (field === "userName") {
      conflictCopy = t.users.errors.conflictUserName;
      fieldErrors.userName = conflictCopy;
    } else {
      conflictCopy = t.users.errors.conflictGeneric;
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  let formMessage =
    conflictCopy ?? errorCopy(code, t) ?? message ?? t.users.errors.fallback;

  if (code === "ROLE_NOT_ALLOWED") {
    formMessage += allowedRolesHint(details, actorRoleCode, t);
  }
  if (hasFieldErrors && code === "BAD_REQUEST") {
    formMessage = t.users.form.reviewFields;
  }

  return {
    status: "error",
    message: formMessage,
    code,
    fieldErrors,
    values,
    savedUser: null,
  };
}

function forbiddenState(values: UserFormValues, t: Dictionary): UserFormState {
  return {
    status: "error",
    message: t.users.errors.FORBIDDEN,
    code: "FORBIDDEN",
    fieldErrors: {},
    values,
    savedUser: null,
  };
}

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const t = await getDictionary();
  const actor = await requireUser();
  const values = readValues(formData);

  if (!canManageUsers(actor.role.code)) return forbiddenState(values, t);

  const password = String(formData.get("password") ?? "");
  const policyError = passwordPolicyError(password, t);

  if (policyError) {
    return {
      status: "error",
      message: t.users.form.reviewFields,
      code: "WEAK_PASSWORD",
      fieldErrors: { password: policyError },
      values,
      savedUser: null,
    };
  }

  const token = await getSessionToken();
  const result = await apiRequest<{ user: UserView }>("/users", {
    method: "POST",
    token,
    body: {
      fullName: values.fullName,
      userName: values.userName,
      email: values.email,
      password,
      roleCode: values.roleCode,
      ...(values.jobTitle ? { jobTitle: values.jobTitle } : {}),
      isActive: values.isActive,
    },
  });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return toErrorState(result, values, actor.role.code, t);
  }

  revalidatePath("/users");

  const created = result.data.user;

  return {
    status: "success",
    message: null,
    code: null,
    fieldErrors: {},
    values: EMPTY_USER_FORM_VALUES,
    savedUser: {
      fullName: created.fullName,
      userName: created.userName,
      email: created.email,
      roleName: roleName(created.role.code, t),
    },
  };
}

export async function updateUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const t = await getDictionary();
  const actor = await requireUser();
  const values = readValues(formData);
  const id = Number(formData.get("id"));

  if (!canManageUsers(actor.role.code)) return forbiddenState(values, t);

  if (!Number.isInteger(id) || id <= 0) {
    return {
      status: "error",
      message: t.users.errors.NOT_FOUND,
      code: "NOT_FOUND",
      fieldErrors: {},
      values,
      savedUser: null,
    };
  }

  const password = String(formData.get("password") ?? "");

  if (password) {
    const policyError = passwordPolicyError(password, t);
    if (policyError) {
      return {
        status: "error",
        message: "Please review the highlighted fields.",
        code: "WEAK_PASSWORD",
        fieldErrors: { password: policyError },
        values,
        savedUser: null,
      };
    }
  }

  const token = await getSessionToken();
  const result = await apiRequest<{ user: UserView }>(`/users/${id}`, {
    method: "PATCH",
    token,
    body: {
      fullName: values.fullName,
      userName: values.userName,
      email: values.email,
      roleCode: values.roleCode,
      jobTitle: values.jobTitle || null,
      isActive: values.isActive,
      ...(password ? { password } : {}),
    },
  });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return toErrorState(result, values, actor.role.code, t);
  }

  revalidatePath("/users");
  revalidatePath(`/users/${id}`);

  const saved = result.data.user;

  return {
    status: "success",
    message: null,
    code: null,
    fieldErrors: {},
    values: {
      fullName: saved.fullName,
      userName: saved.userName,
      email: saved.email,
      roleCode: saved.role.code,
      jobTitle: saved.jobTitle ?? "",
      isActive: saved.isActive,
    },
    savedUser: {
      fullName: saved.fullName,
      userName: saved.userName,
      email: saved.email,
      roleName: roleName(saved.role.code, t),
    },
  };
}

async function setUserActive(
  id: number,
  isActive: boolean,
): Promise<RowActionState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canManageUsers(actor.role.code)) {
    return { status: "error", message: t.users.errors.FORBIDDEN };
  }

  const token = await getSessionToken();
  const result = isActive
    ? await apiRequest<{ user: UserView }>(`/users/${id}`, {
        method: "PATCH",
        token,
        body: { isActive: true },
      })
    : await apiRequest<{ user: UserView }>(`/users/${id}`, {
        method: "DELETE",
        token,
      });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return {
      status: "error",
      message:
        errorCopy(result.error.code, t) ??
        result.error.message ??
        t.users.errors.fallback,
    };
  }

  revalidatePath("/users");
  revalidatePath(`/users/${id}`);

  const user = result.data.user;

  return {
    status: "success",
    message: isActive
      ? t.users.errors.reactivated(user.fullName)
      : t.users.errors.deactivated(user.fullName),
  };
}

export async function deactivateUserAction(
  _prevState: RowActionState,
  formData: FormData,
): Promise<RowActionState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    const t = await getDictionary();
    return { status: "error", message: t.users.errors.NOT_FOUND };
  }

  return setUserActive(id, false);
}

export async function reactivateUserAction(
  _prevState: RowActionState,
  formData: FormData,
): Promise<RowActionState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    const t = await getDictionary();
    return { status: "error", message: t.users.errors.NOT_FOUND };
  }

  return setUserActive(id, true);
}
