"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDictionary } from "@/i18n/server";
import { apiRequest } from "@/lib/api/client";
import { getSessionToken, requireUser } from "@/lib/auth/session";
import { canManagePayroll } from "@/lib/users/roles";
import { isCountryCode } from "./countries";
import {
  readPayTerms,
  type PayrollRulesField,
  type PayrollRulesFormState,
  type PayTermsRowState,
} from "./pay-terms";

const NUMBER = /^\d{1,3}([.,]\d{1,2})?$/;
const MONEY = /^\d{1,10}([.,]\d{1,2})?$/;
const SUNDAY_PREMIUM_MAX = 200;

const RULE_FIELDS: PayrollRulesField[] = [
  "overtimeMultiplier",
  "weeklyDoubleOvertimeHours",
  "overtimeTripleMultiplier",
  "holidayMultiplier",
  "sundayPremiumPercent",
];

function readNumber(formData: FormData, field: string): number | null {
  const raw = String(formData.get(field) ?? "").trim();
  return NUMBER.test(raw) ? Number(raw.replace(",", ".")) : null;
}

export async function savePayrollRulesAction(
  _prevState: PayrollRulesFormState,
  formData: FormData,
): Promise<PayrollRulesFormState> {
  const t = await getDictionary();
  const actor = await requireUser();
  const labels = t.payrollRules;

  const values: PayrollRulesFormState["values"] = {};
  for (const field of RULE_FIELDS) {
    values[field] = String(formData.get(field) ?? "").trim();
  }

  const fail = (message: string): PayrollRulesFormState => ({
    status: "error",
    message,
    values,
  });

  if (!canManagePayroll(actor)) return fail(labels.errors.FORBIDDEN);

  const countryCode = String(formData.get("countryCode") ?? "");
  if (!isCountryCode(countryCode)) return fail(t.payTerms.errors.country);

  const multipliers = [
    ["overtimeMultiplier", labels.overtimeMultiplier],
    ["overtimeTripleMultiplier", labels.overtimeTripleMultiplier],
    ["holidayMultiplier", labels.holidayMultiplier],
  ] as const;

  const body: Record<string, number | null> = {};

  for (const [field, label] of multipliers) {
    const value = readNumber(formData, field);
    if (value === null || value < 1 || value > 10) {
      return fail(labels.errors.range(label, 1, 10));
    }
    body[field] = value;
  }

  const premium = values.sundayPremiumPercent ?? "";
  if (!/^\d{1,3}$/.test(premium) || Number(premium) > SUNDAY_PREMIUM_MAX) {
    return fail(
      labels.errors.range(labels.sundayPremiumPercent, 0, SUNDAY_PREMIUM_MAX),
    );
  }
  body.sundayMultiplier = 1 + Number(premium) / 100;

  const rawWeekly = values.weeklyDoubleOvertimeHours ?? "";
  if (rawWeekly) {
    const weekly = readNumber(formData, "weeklyDoubleOvertimeHours");
    if (weekly === null || weekly > 168) {
      return fail(
        labels.errors.range(labels.weeklyDoubleOvertimeHours, 0, 168),
      );
    }
    body.weeklyDoubleOvertimeHours = weekly;
  } else {
    body.weeklyDoubleOvertimeHours = null;
  }

  const token = await getSessionToken();
  const result = await apiRequest(`/payroll/rules/${countryCode}`, {
    method: "PUT",
    token,
    body,
  });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return fail(
      result.error.code === "FORBIDDEN"
        ? labels.errors.FORBIDDEN
        : labels.errors.fallback,
    );
  }

  revalidatePath("/payroll-rules");

  return { status: "success", message: labels.saved, values: null };
}

export async function updatePayTermsAction(
  _prevState: PayTermsRowState,
  formData: FormData,
): Promise<PayTermsRowState> {
  const t = await getDictionary();
  const actor = await requireUser();
  const copy = t.payTermsPage.errors;

  if (!canManagePayroll(actor)) {
    return { status: "error", message: copy.FORBIDDEN, savedAt: null };
  }

  const id = Number(formData.get("assignmentId"));
  if (!Number.isInteger(id) || id <= 0) {
    return { status: "error", message: copy.NOT_FOUND, savedAt: null };
  }

  const { terms, error } = readPayTerms(formData, t);
  if (error) return { status: "error", message: error, savedAt: null };

  const rawRate = String(formData.get("payRate") ?? "").trim();
  if (!MONEY.test(rawRate)) {
    return { status: "error", message: copy.payRateInvalid, savedAt: null };
  }

  const token = await getSessionToken();
  const result = await apiRequest(`/payroll/assignments/${id}`, {
    method: "PATCH",
    token,
    body: { ...terms, payRate: Number(rawRate.replace(",", ".")) },
  });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    const known = (copy as Record<string, string>)[result.error.code];
    return { status: "error", message: known ?? copy.fallback, savedAt: null };
  }

  revalidatePath("/pay-terms");

  return {
    status: "success",
    message: t.payTermsPage.saved,
    savedAt: Date.now(),
  };
}
