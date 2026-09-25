import type { ApproverType } from "@/lib/timesheets/types";
import type { ApprovalStepView } from "./types";

export type CompanyFormValues = {
  legalName: string;
  tradeName: string;
  rfc: string;
  isActive: boolean;
};

export type CompanyFormField = "legalName" | "tradeName" | "rfc";

export type CompanyFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<CompanyFormField, string>>;
  values: CompanyFormValues;
  savedName: string | null;
};

export const EMPTY_COMPANY_FORM_VALUES: CompanyFormValues = {
  legalName: "",
  tradeName: "",
  rfc: "",
  isActive: true,
};

export const INITIAL_COMPANY_FORM_STATE: CompanyFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: EMPTY_COMPANY_FORM_VALUES,
  savedName: null,
};

export type ClientFormValues = {
  companyId: string;
  userId: string;
  clientName: string;
  contactEmail: string;
  isActive: boolean;
};

export type ClientFormField =
  "companyId" | "userId" | "clientName" | "contactEmail";

export type ClientFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<ClientFormField, string>>;
  values: ClientFormValues;
  savedName: string | null;
};

export const EMPTY_CLIENT_FORM_VALUES: ClientFormValues = {
  companyId: "",
  userId: "",
  clientName: "",
  contactEmail: "",
  isActive: true,
};

export const INITIAL_CLIENT_FORM_STATE: ClientFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: EMPTY_CLIENT_FORM_VALUES,
  savedName: null,
};

export type ProjectFormValues = {
  companyId: string;
  clientId: string;
  projectName: string;
  code: string;
  managerId: string;
  startDate: string;
  endDate: string;
};

export type ProjectFormField =
  "clientId" | "projectName" | "code" | "managerId" | "startDate" | "endDate";

export type ProjectFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<ProjectFormField, string>>;
  values: ProjectFormValues;
  savedName: string | null;
};

export const EMPTY_PROJECT_FORM_VALUES: ProjectFormValues = {
  companyId: "",
  clientId: "",
  projectName: "",
  code: "",
  managerId: "",
  startDate: "",
  endDate: "",
};

export const INITIAL_PROJECT_FORM_STATE: ProjectFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  values: EMPTY_PROJECT_FORM_VALUES,
  savedName: null,
};

export type AssignmentFormField =
  | "consultantId"
  | "payRate"
  | "startDate"
  | "endDate"
  | "assignmentCode";

export type AssignmentFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<AssignmentFormField, string>>;
};

export const INITIAL_ASSIGNMENT_FORM_STATE: AssignmentFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export type AssignmentRowState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const INITIAL_ASSIGNMENT_ROW_STATE: AssignmentRowState = {
  status: "idle",
  message: null,
};

export type ProjectLifecycleFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  effectiveDateError: string | null;
  summary: { closedAssignments: number; strandedTimesheets: number } | null;
};

export const INITIAL_PROJECT_LIFECYCLE_STATE: ProjectLifecycleFormState = {
  status: "idle",
  message: null,
  effectiveDateError: null,
  summary: null,
};

export type ApprovalStepDraft = {
  key: string;
  approverType: ApproverType;
  userId: string;
  roleCode: string;
  clientId: string;
  approverName: string;
};

export type ApprovalStepsFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  stepErrors: Record<number, string>;
  steps: ApprovalStepDraft[] | null;
  savedAt: number;
};

export const INITIAL_APPROVAL_STEPS_FORM_STATE: ApprovalStepsFormState = {
  status: "idle",
  message: null,
  stepErrors: {},
  steps: null,
  savedAt: 0,
};

export function emptyApprovalStepDraft(
  key: string,
  approverType: ApproverType = "CLIENT_EMAIL",
  clientId = "",
): ApprovalStepDraft {
  return {
    key,
    approverType,
    userId: "",
    roleCode: "",
    clientId,
    approverName: "",
  };
}

export function toApprovalStepDraft(
  step: ApprovalStepView,
  key: string,
): ApprovalStepDraft {
  return {
    key,
    approverType: step.approverType,
    userId: step.approver ? String(step.approver.id) : "",
    roleCode: step.roleCode ?? "",
    clientId: step.client ? String(step.client.id) : "",
    approverName: step.approverName ?? "",
  };
}
