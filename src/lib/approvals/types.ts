import type {
  ApprovalStatus,
  ApproverType,
  TimesheetStatus,
} from "@/lib/timesheets/types";
import type { PaySummary } from "@/lib/payroll/pay-terms";
import type { TimesheetAttachment } from "@/lib/timesheets/types";

export type PendingApproval = {
  approvalId: number;
  timesheetId: number;
  seq: number;
  cycleNo: number;
  approverType: ApproverType;
  approverRoleCode: string | null;
  approverEmail: string | null;
  approverName: string | null;
  onBehalf: boolean;
  submissionCode: string | null;
  status: TimesheetStatus;
  weekStart: string;
  weekEnd: string;
  totalMinutes: number;
  totalHours: number;
  payRate?: number | null;
  hourlyRate?: number | null;
  currency?: string;
  amount?: number | null;
  pay?: PaySummary | null;
  submittedAt: string | null;
  assignmentCode: string | null;
  consultant: { id: number; name: string };
  project: { id: number; name: string; code: string | null };
  client: { id: number; name: string };
  company: { id: number; name: string } | null;
};

export type ApprovalStepSummary = {
  seq: number;
  approverType: ApproverType;
  approverName: string | null;
  approverEmail: string | null;
  approverRoleCode: string | null;
};

export type ExternalApproval = {
  timesheetId: number;
  timesheetStatus: TimesheetStatus;
  submissionCode: string | null;
  cycleNo: number;
  currentSeq: number | null;
  completed: boolean;
  approved: {
    approvalId: number;
    seq: number;
    approverEmail: string | null;
    approverName: string | null;
    resolvedVia: string;
  };
  nextStep: ApprovalStepSummary | null;
  notifications: { inApp: number; email: number; emailDelivered: number };
};

export type DecisionOutcome =
  "ADVANCED" | "COMPLETED" | "RETURNED_TO_PREVIOUS" | "RETURNED_TO_CONSULTANT";

export type RejectTarget = "PREVIOUS" | "CONSULTANT";

export type ApprovalDecision = {
  timesheetId: number;
  timesheetStatus: TimesheetStatus;
  submissionCode: string | null;
  cycleNo: number;
  currentSeq: number | null;
  outcome: DecisionOutcome;
  decided: {
    approvalId: number;
    seq: number;
    status: string;
    approverType: ApproverType;
    resolvedVia: string;
  };
  nextStep: ApprovalStepSummary | null;
  notifications: { inApp: number; email: number; emailDelivered: number };
};

export type ApprovalActivity = {
  lineNo: number;
  minutes: number;
  hours: number;
  activity: string;
};

export type ApprovalDay = {
  date: string;
  minutes: number;
  hours: number;
  note: string | null;
  activities: ApprovalActivity[];
};

export type ApprovalAttachment = {
  id: number;
  approvalId: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: { id: number; name: string | null };
  uploadedAt: string;
};

export type ApprovalTimelineStep = ApprovalStepSummary & {
  status: ApprovalStatus;
  decidedAt: string | null;
  decidedBy: { id: number; name: string } | null;
  comments: string | null;
};

export type ApprovalDetail = {
  approvalId: number;
  timesheetId: number;
  seq: number;
  cycleNo: number;
  approverType: ApproverType;
  approverName: string | null;
  approverEmail: string | null;
  approverRoleCode: string | null;
  status: ApprovalStatus;
  onBehalf: boolean;
  canDecide: boolean;
  canApproveOnBehalf: boolean;
  canSeeActivities: boolean;
  submissionCode: string | null;
  timesheetStatus: TimesheetStatus;
  currentSeq: number | null;
  weekStart: string;
  weekEnd: string;
  totalMinutes: number;
  totalHours: number;
  payRate: number | null;
  hourlyRate: number | null;
  currency: string;
  amount: number | null;
  pay: PaySummary | null;
  submittedAt: string | null;
  assignmentCode: string | null;
  consultant: { id: number; name: string; jobTitle: string | null };
  project: { id: number; name: string; code: string | null };
  client: { id: number; name: string };
  company: { id: number; name: string } | null;
  days: ApprovalDay[];
  steps: ApprovalTimelineStep[];
  attachments: ApprovalAttachment[];
  timesheetAttachments: TimesheetAttachment[];
};

export type DecisionKind =
  "APPROVED" | "RETURNED_TO_PREVIOUS" | "RETURNED_TO_CONSULTANT";

export type ApprovalDecisionHistory = {
  eventId: number;
  approvalId: number | null;
  timesheetId: number;
  decision: DecisionKind;
  decidedAt: string;
  comments: string | null;
  seq: number | null;
  submissionCode: string | null;
  timesheetStatus: TimesheetStatus;
  weekStart: string;
  weekEnd: string;
  totalMinutes: number;
  totalHours: number;
  hourlyRate?: number | null;
  currency?: string;
  amount?: number | null;
  assignmentCode: string | null;
  consultant: { id: number; name: string };
  project: { id: number; name: string };
  client: { id: number; name: string };
  company: { id: number; name: string } | null;
};
