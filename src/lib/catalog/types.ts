import type { ApproverType } from "@/lib/timesheets/types";
import type { PayTerms } from "@/lib/payroll/pay-terms";
import type { RatePeriod } from "@/lib/rates/rates";

export type CompanyView = {
  id: number;
  legalName: string;
  tradeName: string;
  rfc: string | null;
  isActive: boolean;
};

export type ClientView = {
  id: number;
  clientName: string;
  contactEmail: string | null;
  isActive: boolean;
  company: CompanyView | null;
  user: { id: number; fullName: string; email: string } | null;
};

export type PersonView = {
  id: number;
  fullName: string;
  email: string;
  roleCode: string | null;
  isActive: boolean;
};

export type ProjectStatus = "ACTIVE" | "CLOSED";

export type ProjectView = {
  id: number;
  projectName: string;
  code: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
  closedAt: string | null;
  client: { id: number; name: string; isActive: boolean } | null;
  manager: PersonView | null;
};

export type ProjectAssignmentView = {
  id: number;
  projectId: number;
  payRate: number;
  ratePeriod: RatePeriod;
  currency: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  assignmentCode: string | null;
  payTerms: PayTerms;
  consultant: PersonView | null;
};

export type CloseProjectResult = {
  project: ProjectView;
  closedAssignments: number;
  strandedTimesheets: number;
};

export type ApprovalClientView = {
  id: number;
  name: string;
  contactEmail: string | null;
};

export type ApprovalStepView = {
  id: number;
  seq: number;
  approverType: ApproverType;
  approver: PersonView | null;
  roleCode: string | null;
  roleName: string | null;
  client: ApprovalClientView | null;
  approverEmail: string | null;
  approverName: string | null;
};

export type ApprovalWorkflowView = {
  approvalSteps: ApprovalStepView[];
  minApprovers: number;
  maxApprovers: number;
  isComplete: boolean;
};

export const ASSIGNMENT_CODE_MAX = 50;

export const RFC_LENGTHS = [12, 13] as const;

export const PROJECT_STATUS_ACTIVE: ProjectStatus = "ACTIVE";
export const PROJECT_STATUS_CLOSED: ProjectStatus = "CLOSED";

export const APPROVERS_MIN = 2;
export const APPROVERS_MAX = 10;
