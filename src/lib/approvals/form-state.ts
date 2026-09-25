export type ApproveOnBehalfState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const INITIAL_APPROVE_ON_BEHALF_STATE: ApproveOnBehalfState = {
  status: "idle",
  message: null,
};

export const ON_BEHALF_COMMENTS_MAX = 500;

export type DecideApprovalState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const INITIAL_DECIDE_APPROVAL_STATE: DecideApprovalState = {
  status: "idle",
  message: null,
};

export const DECISION_COMMENTS_MAX = 500;

export const EVIDENCE_MAX_BYTES = 10 * 1024 * 1024;

export const EVIDENCE_ACCEPT =
  "application/pdf,image/png,image/jpeg,image/webp";
