"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDictionary } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import { apiRequest } from "@/lib/api/client";
import { getSessionToken, requireUser } from "@/lib/auth/session";
import { approvalStepLabel } from "@/lib/timesheets/approvals";
import { canApproveOnBehalf, canReviewTimesheets } from "@/lib/users/roles";
import {
  DECISION_COMMENTS_MAX,
  EVIDENCE_MAX_BYTES,
  INITIAL_APPROVE_ON_BEHALF_STATE,
  INITIAL_DECIDE_APPROVAL_STATE,
  ON_BEHALF_COMMENTS_MAX,
  type ApproveOnBehalfState,
  type DecideApprovalState,
} from "./form-state";
import { fetchPendingApprovalIndex } from "./queries";
import type { ApprovalDecision, ExternalApproval, RejectTarget } from "./types";

async function continueIfNextIsMine(
  timesheetId: number,
  decidedApprovalId: number,
): Promise<void> {
  const { approvalIdByTimesheet } = await fetchPendingApprovalIndex();
  const nextApprovalId = approvalIdByTimesheet.get(timesheetId);

  if (nextApprovalId && nextApprovalId !== decidedApprovalId) {
    redirect(`/reviews/${nextApprovalId}?continued=1`);
  }
}

function errorCopy(code: string, t: Dictionary): string | undefined {
  return (t.approvals.errors as Record<string, unknown>)[code] as
    string | undefined;
}

export async function approveOnBehalfAction(
  _prevState: ApproveOnBehalfState,
  formData: FormData,
): Promise<ApproveOnBehalfState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canApproveOnBehalf(actor)) {
    return { status: "error", message: t.approvals.errors.FORBIDDEN };
  }

  const approvalId = Number(formData.get("approvalId"));

  if (!Number.isInteger(approvalId) || approvalId <= 0) {
    return { status: "error", message: t.approvals.errors.fallback };
  }

  const comments = String(formData.get("comments") ?? "")
    .trim()
    .slice(0, ON_BEHALF_COMMENTS_MAX);

  const evidence = readEvidence(formData);

  if (evidence && evidence.size > EVIDENCE_MAX_BYTES) {
    return { status: "error", message: t.approvals.errors.EVIDENCE_TOO_LARGE };
  }

  const token = await getSessionToken();
  const result = await apiRequest<{ approval: ExternalApproval }>(
    `/approvals/${approvalId}/approve-on-behalf`,
    {
      method: "POST",
      token,
      body: buildPayload(comments ? { comments } : {}, evidence),
    },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");

    return {
      status: "error",
      message:
        errorCopy(result.error.code, t) ??
        result.error.message ??
        t.approvals.errors.fallback,
    };
  }

  const { approval } = result.data;

  revalidatePath("/reviews");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  if (!approval.completed) {
    await continueIfNextIsMine(approval.timesheetId, approvalId);
  }

  return {
    ...INITIAL_APPROVE_ON_BEHALF_STATE,
    status: "success",
    message: approval.completed
      ? t.approvals.onBehalf.completed(
          approval.submissionCode ?? String(approval.timesheetId),
        )
      : t.approvals.onBehalf.advanced(
          approval.nextStep
            ? approvalStepLabel(approval.nextStep, t)
            : t.common.unknown,
        ),
  };
}

function decisionMessage(decision: ApprovalDecision, t: Dictionary): string {
  const code = decision.submissionCode ?? String(decision.timesheetId);
  const nextLabel = decision.nextStep
    ? approvalStepLabel(decision.nextStep, t)
    : t.common.unknown;

  switch (decision.outcome) {
    case "COMPLETED":
      return t.approvals.decide.completed(code);
    case "ADVANCED":
      return t.approvals.decide.advanced(nextLabel);
    case "RETURNED_TO_PREVIOUS":
      return t.approvals.decide.returnedToPrevious(nextLabel);
    default:
      return t.approvals.decide.returnedToConsultant(code);
  }
}

function readRejectTarget(
  value: FormDataEntryValue | null,
): RejectTarget | null {
  return value === "PREVIOUS" || value === "CONSULTANT" ? value : null;
}

function readEvidence(formData: FormData): File | null {
  const file = formData.get("evidence");
  if (!(file instanceof File) || file.size === 0) return null;
  return file;
}

function buildPayload(
  fields: Record<string, string>,
  evidence: File | null,
): FormData | Record<string, string> {
  if (!evidence) return fields;

  const payload = new FormData();
  for (const [key, value] of Object.entries(fields)) payload.set(key, value);
  payload.set("evidence", evidence, evidence.name);

  return payload;
}

export async function decideApprovalAction(
  _prevState: DecideApprovalState,
  formData: FormData,
): Promise<DecideApprovalState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canReviewTimesheets(actor)) {
    return { status: "error", message: t.approvals.errors.NOT_STEP_APPROVER };
  }

  const approvalId = Number(formData.get("approvalId"));

  if (!Number.isInteger(approvalId) || approvalId <= 0) {
    return { status: "error", message: t.approvals.errors.fallback };
  }

  const comments = String(formData.get("comments") ?? "")
    .trim()
    .slice(0, DECISION_COMMENTS_MAX);

  const approving = formData.get("decision") === "APPROVE";
  const target = readRejectTarget(formData.get("target"));

  if (!approving && target === null) {
    return { status: "error", message: t.approvals.errors.fallback };
  }

  if (!approving && !comments) {
    return { status: "error", message: t.approvals.errors.COMMENTS_REQUIRED };
  }

  const evidence = readEvidence(formData);

  if (evidence && evidence.size > EVIDENCE_MAX_BYTES) {
    return { status: "error", message: t.approvals.errors.EVIDENCE_TOO_LARGE };
  }

  const fields: Record<string, string> = approving
    ? comments
      ? { comments }
      : {}
    : { target: target as string, comments };

  const token = await getSessionToken();
  const result = await apiRequest<{ approval: ApprovalDecision }>(
    approving
      ? `/approvals/${approvalId}/approve`
      : `/approvals/${approvalId}/reject`,
    { method: "POST", token, body: buildPayload(fields, evidence) },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");

    return {
      status: "error",
      message:
        errorCopy(result.error.code, t) ??
        result.error.message ??
        t.approvals.errors.fallback,
    };
  }

  revalidatePath("/reviews");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  const decision = result.data.approval;

  if (
    decision.outcome === "ADVANCED" ||
    decision.outcome === "RETURNED_TO_PREVIOUS"
  ) {
    await continueIfNextIsMine(decision.timesheetId, approvalId);
  }

  return {
    ...INITIAL_DECIDE_APPROVAL_STATE,
    status: "success",
    message: decisionMessage(decision, t),
  };
}
