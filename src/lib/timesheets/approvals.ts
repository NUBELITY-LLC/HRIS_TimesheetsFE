import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDateTimeLong } from "@/lib/format/datetime";
import { roleName } from "@/lib/users/roles";
import { isRejected, type ApprovalStatus, type ApproverType } from "./types";

export type ApprovalChipState = "approved" | "current" | "pending" | "rejected";

export type ApproverDescriptor = {
  seq: number;
  approverType: ApproverType;
  approverName: string | null;
  approverEmail?: string | null;
  approverRoleCode: string | null;
};

export function approvalStepLabel(
  approver: ApproverDescriptor,
  t: Dictionary,
): string {
  if (approver.approverName) return approver.approverName;

  if (approver.approverType === "CLIENT_EMAIL") {
    return approver.approverEmail ?? t.approvals.client;
  }

  if (approver.approverRoleCode) return roleName(approver.approverRoleCode, t);

  return t.approvals.step(approver.seq);
}

export function isExternalApprover(approverType: ApproverType): boolean {
  return approverType === "CLIENT_EMAIL";
}

export function approvalChipState(
  step: { seq: number; status: ApprovalStatus },
  currentSeq: number | null,
): ApprovalChipState {
  if (isRejected(step.status)) return "rejected";
  if (step.status === "APPROVED") return "approved";

  return step.seq === currentSeq ? "current" : "pending";
}

export type DecidedStep = ApproverDescriptor & {
  status: ApprovalStatus;
  decidedAt: string | null;
  decidedBy: { id: number; name: string } | null;
};

export function decidedByOther(step: DecidedStep, t: Dictionary): boolean {
  return (
    step.decidedBy !== null &&
    step.decidedBy.name !== approvalStepLabel(step, t)
  );
}

export function decisionActor(step: DecidedStep, t: Dictionary): string {
  const label = approvalStepLabel(step, t);

  return step.decidedBy && decidedByOther(step, t)
    ? t.approvals.decidedFor(step.decidedBy.name, label)
    : label;
}

export function decisionSummary(
  step: DecidedStep,
  t: Dictionary,
  locale: Locale,
): string | null {
  if (step.status === "PENDING" || !step.decidedAt) return null;

  const date = formatDateTimeLong(step.decidedAt, locale, {
    empty: t.common.none,
    invalid: t.common.unknown,
  });

  return t.approvals.decisions[step.status](decisionActor(step, t), date);
}

export function latestDecision<Step extends DecidedStep>(
  steps: Step[],
): Step | null {
  return steps.reduce<Step | null>(
    (latest, step) =>
      step.decidedAt &&
      step.status !== "PENDING" &&
      (!latest?.decidedAt || step.decidedAt > latest.decidedAt)
        ? step
        : latest,
    null,
  );
}
