"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { Dictionary } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/server";
import { apiRequest } from "@/lib/api/client";
import { readValidationIssues } from "@/lib/api/types";
import { getSessionToken, requireUser } from "@/lib/auth/session";
import { evidenceIssue } from "@/lib/timesheets/evidence";
import { canReviewFeedback } from "@/lib/users/roles";
import {
  FEEDBACK_BODY_MAX,
  FEEDBACK_EVIDENCE_MAX,
  isFeedbackCategory,
  isFeedbackNoteKind,
  isFeedbackStatus,
  type FeedbackActionState,
  type FeedbackTracking,
  type SubmitFeedbackState,
  type TrackFeedbackState,
} from "./types";

function errorCopy(code: string, t: Dictionary): string {
  return (t.feedback.errors as Record<string, string>)[code] ?? t.feedback.errors.fallback;
}

function submitFailure(message: string): SubmitFeedbackState {
  return { status: "error", message, fieldErrors: {}, trackingCode: null };
}

export async function submitFeedbackAction(
  _prevState: SubmitFeedbackState,
  formData: FormData,
): Promise<SubmitFeedbackState> {
  const t = await getDictionary();
  const token = await getSessionToken();
  if (!token) redirect("/login?reason=session_expired");

  const category = String(formData.get("category") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const files = formData
    .getAll("evidence")
    .filter((item): item is File => item instanceof File && item.size > 0);

  const fieldErrors: SubmitFeedbackState["fieldErrors"] = {};
  if (!isFeedbackCategory(category)) fieldErrors.category = t.feedback.form.categoryRequired;
  if (!body) fieldErrors.body = t.feedback.form.bodyRequired;
  else if (body.length > FEEDBACK_BODY_MAX) {
    fieldErrors.body = t.feedback.form.bodyTooLong(FEEDBACK_BODY_MAX);
  }
  if (files.length > FEEDBACK_EVIDENCE_MAX) {
    fieldErrors.evidence = t.feedback.form.limit(FEEDBACK_EVIDENCE_MAX);
  } else {
    const issue = files.map((file) => evidenceIssue(file, t)).find(Boolean);
    if (issue) fieldErrors.evidence = issue;
  }

  if (Object.keys(fieldErrors).length) {
    return {
      status: "error",
      message: t.feedback.form.reviewFields,
      fieldErrors,
      trackingCode: null,
    };
  }

  const payload = new FormData();
  payload.set("category", category);
  payload.set("body", body);
  files.forEach((file, index) => payload.append("evidence", file, `evidencia-${index + 1}`));

  const result = await apiRequest<{ trackingCode: string }>("/feedback/submissions", {
    method: "POST",
    token,
    body: payload,
    anonymous: true,
  });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return submitFailure(errorCopy(result.error.code, t));
  }

  return {
    status: "sent",
    message: null,
    fieldErrors: {},
    trackingCode: result.data.trackingCode,
  };
}

export async function trackFeedbackAction(
  _prevState: TrackFeedbackState,
  formData: FormData,
): Promise<TrackFeedbackState> {
  const t = await getDictionary();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) {
    return { status: "error", message: t.feedback.tracking.codeRequired, code, result: null };
  }

  const result = await apiRequest<{ case: FeedbackTracking }>("/feedback/tracking", {
    method: "POST",
    body: { code: code.slice(0, 40) },
    anonymous: true,
  });

  if (!result.ok) {
    return { status: "error", message: errorCopy(result.error.code, t), code, result: null };
  }

  return { status: "found", message: null, code, result: result.data.case };
}

function actionFailure(message: string): FeedbackActionState {
  return { status: "error", message, fieldErrors: {}, savedAt: null };
}

export async function updateFeedbackStatusAction(
  _prevState: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canReviewFeedback(actor)) return actionFailure(t.feedback.errors.FORBIDDEN);

  const id = Number(formData.get("caseId"));
  const status = String(formData.get("status") ?? "");
  const resolution = String(formData.get("resolution") ?? "").trim();

  if (!Number.isInteger(id) || id <= 0 || !isFeedbackStatus(status)) {
    return actionFailure(t.feedback.errors.fallback);
  }
  if (status === "RESOLVED" && !resolution) {
    return {
      status: "error",
      message: null,
      fieldErrors: { resolution: t.feedback.detail.resolutionRequired },
      savedAt: null,
    };
  }

  const token = await getSessionToken();
  const result = await apiRequest(`/feedback/cases/${id}/status`, {
    method: "PATCH",
    token,
    body: status === "RESOLVED" ? { status, resolution } : { status },
  });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    const resolutionIssue = readValidationIssues(result.error.details).some(
      (issue) => issue.path === "resolution",
    );
    if (resolutionIssue) {
      return {
        status: "error",
        message: null,
        fieldErrors: { resolution: t.feedback.detail.resolutionRequired },
        savedAt: null,
      };
    }
    return actionFailure(errorCopy(result.error.code, t));
  }

  revalidatePath(`/feedback/inbox/${id}`);
  revalidatePath("/feedback/inbox");

  return {
    status: "success",
    message: t.feedback.detail.statusSaved,
    fieldErrors: {},
    savedAt: Date.now(),
  };
}

export async function addFeedbackNoteAction(
  _prevState: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canReviewFeedback(actor)) return actionFailure(t.feedback.errors.FORBIDDEN);

  const id = Number(formData.get("caseId"));
  const kind = String(formData.get("kind") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!Number.isInteger(id) || id <= 0 || !isFeedbackNoteKind(kind)) {
    return actionFailure(t.feedback.errors.fallback);
  }
  if (!body || body.length > FEEDBACK_BODY_MAX) {
    return {
      status: "error",
      message: null,
      fieldErrors: {
        body: body ? t.feedback.form.bodyTooLong(FEEDBACK_BODY_MAX) : t.feedback.detail.noteRequired,
      },
      savedAt: null,
    };
  }

  const token = await getSessionToken();
  const result = await apiRequest(`/feedback/cases/${id}/notes`, {
    method: "POST",
    token,
    body: { kind, body },
  });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return actionFailure(errorCopy(result.error.code, t));
  }

  revalidatePath(`/feedback/inbox/${id}`);
  revalidatePath("/feedback/inbox");

  return {
    status: "success",
    message: t.feedback.detail.noteAdded,
    fieldErrors: {},
    savedAt: Date.now(),
  };
}
