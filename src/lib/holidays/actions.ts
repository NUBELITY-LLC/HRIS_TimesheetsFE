"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDictionary } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import { apiRequest } from "@/lib/api/client";
import { getSessionToken, requireUser } from "@/lib/auth/session";
import { isCountryCode } from "@/lib/payroll/countries";
import { canManagePayroll } from "@/lib/users/roles";
import type { HolidayFormState } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function errorCopy(code: string, t: Dictionary): string {
  return (
    (t.holidays.errors as Record<string, unknown>)[code] as string | undefined
  ) ?? t.holidays.errors.fallback;
}

function failure(message: string): HolidayFormState {
  return { status: "error", message, fieldErrors: {}, savedAt: null };
}

export async function addHolidayAction(
  _prevState: HolidayFormState,
  formData: FormData,
): Promise<HolidayFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canManagePayroll(actor)) return failure(t.holidays.errors.FORBIDDEN);

  const date = String(formData.get("date") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const countryCode = String(formData.get("countryCode") ?? "MX");
  const fieldErrors: HolidayFormState["fieldErrors"] = {};

  if (!ISO_DATE.test(date)) fieldErrors.date = t.holidays.errors.dateRequired;
  if (!name) fieldErrors.name = t.holidays.errors.nameRequired;
  if (!isCountryCode(countryCode)) {
    return failure(t.payTerms.errors.country);
  }

  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: null, fieldErrors, savedAt: null };
  }

  const token = await getSessionToken();
  const result = await apiRequest("/holidays", {
    method: "POST",
    token,
    body: { date, name: name.slice(0, 120), countryCode },
  });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return failure(errorCopy(result.error.code, t));
  }

  revalidatePath("/holidays");

  return {
    status: "success",
    message: t.holidays.added,
    fieldErrors: {},
    savedAt: Date.now(),
  };
}

export async function removeHolidayAction(
  _prevState: HolidayFormState,
  formData: FormData,
): Promise<HolidayFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canManagePayroll(actor)) return failure(t.holidays.errors.FORBIDDEN);

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return failure(t.holidays.errors.fallback);

  const token = await getSessionToken();
  const result = await apiRequest(`/holidays/${id}`, { method: "DELETE", token });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return failure(errorCopy(result.error.code, t));
  }

  revalidatePath("/holidays");

  return {
    status: "success",
    message: t.holidays.removed,
    fieldErrors: {},
    savedAt: Date.now(),
  };
}
