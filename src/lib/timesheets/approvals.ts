import type { Dictionary } from "@/i18n/dictionaries";
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
