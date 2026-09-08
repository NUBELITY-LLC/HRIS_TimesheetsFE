import type { Dictionary } from "@/i18n/dictionaries";
import { roleName } from "@/lib/users/roles";
import { isRejected, type ApprovalStep } from "./types";

export type ApprovalChipState = "approved" | "current" | "pending" | "rejected";

export function approvalStepLabel(step: ApprovalStep, t: Dictionary): string {
  if (step.approverType === "CLIENT_EMAIL") return t.approvals.client;
  if (step.approverName) return step.approverName;
  if (step.approverRoleCode) return roleName(step.approverRoleCode, t);

  return t.approvals.step(step.seq);
}

export function approvalChipState(
  step: ApprovalStep,
  currentSeq: number | null,
): ApprovalChipState {
  if (isRejected(step.status)) return "rejected";
  if (step.status === "APPROVED") return "approved";

  return step.seq === currentSeq ? "current" : "pending";
}
