export type TimesheetOption = {
  id: string;
  name: string;
  clientId?: string;
};

export type TaskEntry = {
  id: string;
  minutes: number | null;
  activity: string;
};

export type WeekEntries = Record<string, TaskEntry[]>;

export const TIMESHEET_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "REJECTED",
  "APPROVED",
  "CLOSED",
  "PAID",
] as const;

export type TimesheetStatus = (typeof TIMESHEET_STATUSES)[number];

export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED_TO_PREVIOUS"
  | "REJECTED_TO_CONSULTANT";

export type ApproverType = "CLIENT_EMAIL" | "USER" | "ROLE";

export type ApprovalStep = {
  seq: number;
  approverType: ApproverType;
  approverName: string | null;
  approverRoleCode: string | null;
  status: ApprovalStatus;
  decidedAt: string | null;
  comments: string | null;
};

export type Assignment = {
  id: number;
  startDate: string;
  endDate: string | null;
  client: { id: number; name: string };
  project: { id: number; name: string; code: string | null };
};

export type TimesheetActivity = {
  lineNo: number;
  minutes: number;
  activity: string;
};

export type TimesheetDay = {
  date: string;
  minutes: number;
  note: string | null;
  activities: TimesheetActivity[];
};

export type Timesheet = {
  id: number;
  assignmentId: number;
  submissionCode: string | null;
  weekStart: string;
  weekEnd: string;
  status: TimesheetStatus;
  totalMinutes: number;
  totalHours: number;
  cycleNo: number;
  currentSeq: number | null;
  submittedAt: string | null;
  updatedAt: string;
  editable: boolean;
  client: { id: number; name: string } | null;
  project: { id: number; name: string; code: string | null } | null;
  days?: TimesheetDay[];
  approvals?: ApprovalStep[];
};

export type TimesheetOwner = {
  fullName: string;
  jobTitle: string | null;
  roleCode: string;
};

export type TeamTimesheet = Timesheet & { owner: TimesheetOwner };

export type TimesheetReview = TeamTimesheet & { days: TimesheetDay[] };

export type DashboardSummary = {
  monthMinutes: number;
  monthTargetMinutes: number | null;
  pendingCount: number;
  approvedCount: number;
};

export type TeamSummary = {
  monthMinutes: number;
  pendingReviewCount: number;
  approvedCount: number;
};

export function isRejected(status: ApprovalStatus): boolean {
  return status === "REJECTED_TO_PREVIOUS" || status === "REJECTED_TO_CONSULTANT";
}

export function currentApprovalStep(
  steps: ApprovalStep[],
  currentSeq: number | null,
): ApprovalStep | null {
  if (currentSeq === null) return null;
  return steps.find((step) => step.seq === currentSeq) ?? null;
}
