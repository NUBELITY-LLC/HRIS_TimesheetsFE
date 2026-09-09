"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDictionary } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import { apiRequest, type ApiResult } from "@/lib/api/client";
import { readValidationIssues } from "@/lib/api/types";
import { getSessionToken, requireUser } from "@/lib/auth/session";
import { canSubmitTimesheets } from "@/lib/users/roles";
import {
  INITIAL_TIMESHEET_FORM_STATE,
  type DraftActionState,
  type DraftDayPayload,
  type TimesheetFormState,
} from "./form-state";
import { isTaskMinutes } from "./rules";
import type { Timesheet } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseDays(raw: string): DraftDayPayload[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((day) => {
    if (!isRecord(day) || typeof day.date !== "string" || !ISO_DATE.test(day.date)) {
      return [];
    }

    const activities = Array.isArray(day.activities) ? day.activities : [];
    const rows = activities.flatMap((row) => {
      if (!isRecord(row)) return [];

      const minutes = Number(row.minutes);
      const activity = String(row.activity ?? "").trim().slice(0, 255);

      if (!isTaskMinutes(minutes)) return [];

      return [{ minutes, activity }];
    });

    return rows.length ? [{ date: day.date, activities: rows }] : [];
  });
}

function errorCopy(code: string, t: Dictionary): string | undefined {
  return (t.timesheets.errors as Record<string, unknown>)[code] as
    | string
    | undefined;
}

function detailString(details: unknown, key: string): string | null {
  if (!isRecord(details)) return null;

  const value = details[key];
  return typeof value === "string" ? value : null;
}

function projectEndMessage(
  details: unknown,
  projectStatus: string,
  t: Dictionary,
): string | null {
  if (detailString(details, "code") !== "PROJECT_CLOSED") return null;

  const endDate = detailString(details, "projectEndDate");
  if (!endDate) return null;

  return projectStatus === "CLOSED"
    ? t.timesheets.errors.projectClosedOn(endDate)
    : t.timesheets.errors.projectEndsOn(endDate);
}

function toErrorState(
  result: Extract<ApiResult<unknown>, { ok: false }>,
  t: Dictionary,
  projectStatus = "",
): TimesheetFormState {
  const { code, message, details } = result.error;

  return {
    status: "error",
    message:
      projectEndMessage(details, projectStatus, t) ??
      errorCopy(code, t) ??
      message ??
      t.timesheets.errors.fallback,
    code,
    issues: readValidationIssues(details).map((issue) => issue.message),
    submissionCode: null,
  };
}

export async function saveTimesheetAction(
  _prevState: TimesheetFormState,
  formData: FormData,
): Promise<TimesheetFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canSubmitTimesheets(actor.role.code)) {
    return {
      ...INITIAL_TIMESHEET_FORM_STATE,
      status: "error",
      code: "FORBIDDEN",
      message: t.timesheets.errors.FORBIDDEN,
    };
  }

  const intent = String(formData.get("intent") ?? "draft");
  const assignmentId = Number(formData.get("assignmentId"));
  const weekStart = String(formData.get("weekStart") ?? "");
  const projectStatus = String(formData.get("projectStatus") ?? "");
  const days = parseDays(String(formData.get("days") ?? "[]"));

  if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
    return {
      ...INITIAL_TIMESHEET_FORM_STATE,
      status: "error",
      code: "ASSIGNMENT_REQUIRED",
      message: t.timesheets.errors.assignmentRequired,
    };
  }

  if (!ISO_DATE.test(weekStart)) {
    return {
      ...INITIAL_TIMESHEET_FORM_STATE,
      status: "error",
      code: "BAD_REQUEST",
      message: t.timesheets.errors.fallback,
    };
  }

  if (
    intent === "submit" &&
    days.some((day) => day.activities.some((row) => !row.activity))
  ) {
    return {
      ...INITIAL_TIMESHEET_FORM_STATE,
      status: "error",
      message: t.timesheets.errors.review,
    };
  }

  if (intent === "submit" && days.length === 0) {
    return {
      ...INITIAL_TIMESHEET_FORM_STATE,
      status: "error",
      code: "TIMESHEET_EMPTY",
      message: t.timesheets.errors.empty,
    };
  }

  const token = await getSessionToken();
  const saved = await apiRequest<{ timesheet: Timesheet }>("/timesheets", {
    method: "PUT",
    token,
    body: { assignmentId, weekStart, days },
  });

  if (!saved.ok) {
    if (saved.status === 401) redirect("/login?reason=session_expired");
    return toErrorState(saved, t, projectStatus);
  }

  revalidatePath("/timesheets");
  revalidatePath("/dashboard");

  if (intent !== "submit") {
    return {
      ...INITIAL_TIMESHEET_FORM_STATE,
      status: "draft",
      message: t.timesheets.draftSaved,
    };
  }

  const submitted = await apiRequest<{
    timesheet: Timesheet;
    confirmation: { submissionCode: string };
  }>(`/timesheets/${saved.data.timesheet.id}/submit`, {
    method: "POST",
    token,
  });

  if (!submitted.ok) {
    if (submitted.status === 401) redirect("/login?reason=session_expired");
    return toErrorState(submitted, t, projectStatus);
  }

  revalidatePath("/timesheets");
  revalidatePath("/dashboard");

  return {
    ...INITIAL_TIMESHEET_FORM_STATE,
    status: "submitted",
    message: t.timesheets.submittedTitle,
    submissionCode: submitted.data.confirmation.submissionCode,
  };
}

export async function discardDraftAction(
  _prevState: DraftActionState,
  formData: FormData,
): Promise<DraftActionState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canSubmitTimesheets(actor.role.code)) {
    return { status: "error", message: t.timesheets.errors.FORBIDDEN };
  }

  const timesheetId = Number(formData.get("timesheetId"));

  if (!Number.isInteger(timesheetId) || timesheetId <= 0) {
    return { status: "error", message: t.timesheets.errors.fallback };
  }

  const token = await getSessionToken();
  const result = await apiRequest<{ discarded: boolean }>(
    `/timesheets/${timesheetId}`,
    { method: "DELETE", token },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return {
      status: "error",
      message:
        errorCopy(result.error.code, t) ??
        result.error.message ??
        t.timesheets.errors.fallback,
    };
  }

  revalidatePath("/timesheets");
  revalidatePath("/dashboard");

  return { status: "success", message: t.timesheets.drafts.discarded };
}
