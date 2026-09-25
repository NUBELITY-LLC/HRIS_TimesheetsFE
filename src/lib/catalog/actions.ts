"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDictionary } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import { apiRequest, type ApiResult } from "@/lib/api/client";
import { readValidationIssues } from "@/lib/api/types";
import { getSessionToken, requireUser } from "@/lib/auth/session";
import {
  APPROVER_ROLE_CODES,
  canBeManagerClient,
  canManageCatalog,
} from "@/lib/users/roles";
import { fetchUser } from "@/lib/users/queries";
import type { ApproverType } from "@/lib/timesheets/types";
import {
  toApprovalStepDraft,
  type ApprovalStepsFormState,
  type ClientFormField,
  type ClientFormState,
  type ClientFormValues,
  type CompanyFormField,
  type CompanyFormState,
  type CompanyFormValues,
  type ProjectFormField,
  type ProjectFormState,
  type ProjectFormValues,
  type ProjectLifecycleFormState,
  type AssignmentFormField,
  type AssignmentFormState,
  type AssignmentRowState,
  INITIAL_ASSIGNMENT_FORM_STATE,
} from "./form-state";
import {
  APPROVERS_MAX,
  APPROVERS_MIN,
  ASSIGNMENT_CODE_MAX,
  type ApprovalWorkflowView,
  type ClientView,
  type CloseProjectResult,
  type CompanyView,
  type ProjectAssignmentView,
  type ProjectView,
} from "./types";

const COMPANY_FIELDS: CompanyFormField[] = ["legalName", "tradeName", "rfc"];
const CLIENT_FIELDS: ClientFormField[] = [
  "companyId",
  "userId",
  "clientName",
  "contactEmail",
];
const PROJECT_FIELDS: ProjectFormField[] = [
  "clientId",
  "projectName",
  "code",
  "managerId",
  "startDate",
  "endDate",
];

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function entityId(formData: FormData): number | null {
  const id = Number(formData.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

function errorCopy(code: string, t: Dictionary): string | undefined {
  return (t.catalog.errors as Record<string, unknown>)[code] as
    string | undefined;
}

function detailField(details: unknown): string | null {
  if (
    typeof details === "object" &&
    details !== null &&
    "field" in details &&
    typeof (details as { field: unknown }).field === "string"
  ) {
    return (details as { field: string }).field;
  }

  return null;
}

function fieldErrorsFrom<Field extends string>(
  details: unknown,
  fields: Field[],
  message: string,
): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};

  for (const issue of readValidationIssues(details)) {
    const field = fields.find((name) => issue.path === name);
    if (field) errors[field] = issue.message;
  }

  const flagged = detailField(details);
  const field = fields.find((name) => name === flagged);
  if (field && !errors[field]) errors[field] = message;

  return errors;
}

type SaveOutcome<Field extends string, Values> = {
  status: "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<Field, string>>;
  values: Values;
  savedName: string | null;
};

function toErrorState<Field extends string, Values>(
  result: Extract<ApiResult<unknown>, { ok: false }>,
  fields: Field[],
  values: Values,
  t: Dictionary,
): SaveOutcome<Field, Values> {
  const message =
    errorCopy(result.error.code, t) ??
    result.error.message ??
    t.catalog.errors.fallback;
  const fieldErrors = fieldErrorsFrom(result.error.details, fields, message);

  return {
    status: "error",
    message: Object.keys(fieldErrors).length
      ? t.catalog.form.reviewFields
      : message,
    fieldErrors,
    values,
    savedName: null,
  };
}

export async function saveCompanyAction(
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  const values: CompanyFormValues = {
    legalName: text(formData, "legalName"),
    tradeName: text(formData, "tradeName"),
    rfc: text(formData, "rfc").toUpperCase(),
    isActive: formData.get("isActive") !== null,
  };

  if (!canManageCatalog(actor)) {
    return {
      status: "error",
      message: t.catalog.errors.FORBIDDEN,
      fieldErrors: {},
      values,
      savedName: null,
    };
  }

  const fieldErrors: Partial<Record<CompanyFormField, string>> = {};
  if (!values.legalName)
    fieldErrors.legalName = t.catalog.errors.legalNameRequired;
  if (!values.tradeName)
    fieldErrors.tradeName = t.catalog.errors.tradeNameRequired;
  if (values.rfc && values.rfc.length !== 12 && values.rfc.length !== 13) {
    fieldErrors.rfc = t.catalog.errors.rfcLength;
  }

  if (Object.keys(fieldErrors).length) {
    return {
      status: "error",
      message: t.catalog.form.reviewFields,
      fieldErrors,
      values,
      savedName: null,
    };
  }

  const id = entityId(formData);
  const token = await getSessionToken();
  const body = {
    legalName: values.legalName,
    tradeName: values.tradeName,
    rfc: values.rfc || null,
    isActive: values.isActive,
  };

  const result = id
    ? await apiRequest<{ company: CompanyView }>(`/companies/${id}`, {
        method: "PATCH",
        token,
        body,
      })
    : await apiRequest<{ company: CompanyView }>("/companies", {
        method: "POST",
        token,
        body,
      });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return toErrorState(result, COMPANY_FIELDS, values, t);
  }

  revalidatePath("/companies");
  revalidatePath("/managers");
  if (id) revalidatePath(`/companies/${id}`);

  const company = result.data.company;

  return {
    status: "success",
    message: null,
    fieldErrors: {},
    values: {
      legalName: company.legalName,
      tradeName: company.tradeName,
      rfc: company.rfc ?? "",
      isActive: company.isActive,
    },
    savedName: company.tradeName,
  };
}

export async function saveClientAction(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  const values: ClientFormValues = {
    companyId: text(formData, "companyId"),
    userId: text(formData, "userId"),
    clientName: text(formData, "clientName"),
    contactEmail: text(formData, "contactEmail"),
    isActive: formData.get("isActive") !== null,
  };

  if (!canManageCatalog(actor)) {
    return {
      status: "error",
      message: t.catalog.errors.FORBIDDEN,
      fieldErrors: {},
      values,
      savedName: null,
    };
  }

  const companyId = Number(values.companyId);
  const userId = Number(values.userId);
  const linkedToUser = Boolean(values.userId);
  const fieldErrors: Partial<Record<ClientFormField, string>> = {};

  if (!Number.isInteger(companyId) || companyId <= 0) {
    fieldErrors.companyId = t.catalog.errors.companyRequired;
  }
  if (linkedToUser && (!Number.isInteger(userId) || userId <= 0)) {
    fieldErrors.userId = t.catalog.errors.managerUserInvalid;
  }
  if (!linkedToUser && !values.clientName) {
    fieldErrors.clientName = t.catalog.errors.clientNameRequired;
  }

  if (Object.keys(fieldErrors).length) {
    return {
      status: "error",
      message: t.catalog.form.reviewFields,
      fieldErrors,
      values,
      savedName: null,
    };
  }

  if (linkedToUser) {
    const managerUser = await fetchUser(userId);

    if (
      !managerUser.ok ||
      !managerUser.user.isActive ||
      !canBeManagerClient(managerUser.user.role.code)
    ) {
      return {
        status: "error",
        message: t.catalog.form.reviewFields,
        fieldErrors: { userId: t.catalog.errors.managerUserInvalid },
        values,
        savedName: null,
      };
    }

    values.clientName = managerUser.user.fullName;
    values.contactEmail = managerUser.user.email;
  }

  const id = entityId(formData);
  const token = await getSessionToken();
  const body = {
    companyId,
    clientName: values.clientName,
    contactEmail: values.contactEmail || null,
    userId: linkedToUser ? userId : null,
    isActive: values.isActive,
  };

  const result = id
    ? await apiRequest<{ client: ClientView }>(`/clients/${id}`, {
        method: "PATCH",
        token,
        body,
      })
    : await apiRequest<{ client: ClientView }>("/clients", {
        method: "POST",
        token,
        body,
      });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return toErrorState(result, CLIENT_FIELDS, values, t);
  }

  revalidatePath("/managers");
  revalidatePath("/projects");
  if (id) revalidatePath(`/managers/${id}`);

  const client = result.data.client;

  return {
    status: "success",
    message: null,
    fieldErrors: {},
    values: {
      companyId: client.company ? String(client.company.id) : "",
      userId: linkedToUser ? String(userId) : "",
      clientName: client.clientName,
      contactEmail: client.contactEmail ?? "",
      isActive: client.isActive,
    },
    savedName: client.clientName,
  };
}

export async function saveProjectAction(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  const endDateLocked = formData.get("lockedEndDate") !== null;
  const values: ProjectFormValues = {
    companyId: text(formData, "companyId"),
    clientId: text(formData, "clientId"),
    projectName: text(formData, "projectName"),
    code: text(formData, "code"),
    managerId: text(formData, "managerId"),
    startDate: text(formData, "startDate"),
    endDate: endDateLocked
      ? text(formData, "lockedEndDate")
      : text(formData, "endDate"),
  };

  if (!canManageCatalog(actor)) {
    return {
      status: "error",
      message: t.catalog.errors.FORBIDDEN,
      fieldErrors: {},
      values,
      savedName: null,
    };
  }

  const clientId = Number(values.clientId);
  const managerId = Number(values.managerId);
  const fieldErrors: Partial<Record<ProjectFormField, string>> = {};

  if (!Number.isInteger(clientId) || clientId <= 0) {
    fieldErrors.clientId = t.catalog.errors.clientRequired;
  }
  if (!values.projectName) {
    fieldErrors.projectName = t.catalog.errors.projectNameRequired;
  }
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    fieldErrors.endDate = t.catalog.errors.dateOrder;
  }

  if (Object.keys(fieldErrors).length) {
    return {
      status: "error",
      message: t.catalog.form.reviewFields,
      fieldErrors,
      values,
      savedName: null,
    };
  }

  const id = entityId(formData);
  const token = await getSessionToken();
  const hasManager = Number.isInteger(managerId) && managerId > 0;
  const body = {
    clientId,
    projectName: values.projectName,
    code: values.code || null,
    startDate: values.startDate || null,
    ...(endDateLocked ? {} : { endDate: values.endDate || null }),
    ...(hasManager ? { managerId } : {}),
  };

  const result = id
    ? await apiRequest<{ project: ProjectView }>(`/projects/${id}`, {
        method: "PATCH",
        token,
        body,
      })
    : await apiRequest<{ project: ProjectView }>("/projects", {
        method: "POST",
        token,
        body,
      });

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return toErrorState(result, PROJECT_FIELDS, values, t);
  }

  revalidatePath("/projects");
  if (id) revalidatePath(`/projects/${id}`);

  const project = result.data.project;

  if (!id) redirect(`/projects/${project.id}?created=1`);

  return {
    status: "success",
    message: null,
    fieldErrors: {},
    values: {
      companyId: values.companyId,
      clientId: project.client ? String(project.client.id) : "",
      projectName: project.projectName,
      code: project.code ?? "",
      managerId: project.manager ? String(project.manager.id) : "",
      startDate: project.startDate ?? "",
      endDate: project.endDate ?? "",
    },
    savedName: project.projectName,
  };
}

type ApprovalStepPayload =
  | { approverType: "USER"; userId: number; approverName?: string }
  | { approverType: "ROLE"; roleCode: string; approverName?: string }
  | { approverType: "CLIENT_EMAIL"; clientId: number };

const APPROVER_TYPES: ApproverType[] = ["CLIENT_EMAIL", "USER", "ROLE"];

function approverType(value: string): ApproverType | null {
  return APPROVER_TYPES.find((type) => type === value) ?? null;
}

function detailPath(details: unknown): string | null {
  if (
    typeof details === "object" &&
    details !== null &&
    "path" in details &&
    typeof (details as { path: unknown }).path === "string"
  ) {
    return (details as { path: string }).path;
  }

  return null;
}

function stepIndexFrom(path: string): number | null {
  const [prefix, position] = path.split(".");
  if (prefix !== "steps") return null;

  const index = Number(position);
  return Number.isInteger(index) && index >= 0 ? index : null;
}

function stepErrorsFrom(
  details: unknown,
  message: string,
): Record<number, string> {
  const errors: Record<number, string> = {};

  for (const issue of readValidationIssues(details)) {
    const index = stepIndexFrom(issue.path);
    if (index !== null && !errors[index]) errors[index] = issue.message;
  }

  const path = detailPath(details);
  const flagged = path ? stepIndexFrom(path) : null;
  if (flagged !== null && !errors[flagged]) errors[flagged] = message;

  return errors;
}

function approvalStepsError(
  message: string,
  stepErrors: Record<number, string> = {},
): ApprovalStepsFormState {
  return {
    status: "error",
    message,
    stepErrors,
    steps: null,
    savedAt: 0,
  };
}

function approverKey(step: ApprovalStepPayload): string {
  if (step.approverType === "USER") return `USER:${step.userId}`;
  if (step.approverType === "ROLE") return `ROLE:${step.roleCode}`;

  return `CLIENT:${step.clientId}`;
}

export async function saveApprovalStepsAction(
  _prevState: ApprovalStepsFormState,
  formData: FormData,
): Promise<ApprovalStepsFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canManageCatalog(actor)) {
    return approvalStepsError(t.catalog.errors.FORBIDDEN);
  }

  const projectId = Number(formData.get("projectId"));
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return approvalStepsError(t.catalog.errors.fallback);
  }

  const declared = Number(formData.get("stepCount"));
  const total = Number.isInteger(declared) && declared > 0 ? declared : 0;

  if (total < APPROVERS_MIN) {
    return approvalStepsError(t.catalog.errors.approversMin(APPROVERS_MIN));
  }
  if (total > APPROVERS_MAX) {
    return approvalStepsError(t.catalog.errors.approversMax(APPROVERS_MAX));
  }

  const steps: ApprovalStepPayload[] = [];
  const stepErrors: Record<number, string> = {};
  const seen = new Map<string, number>();

  for (let index = 0; index < total; index += 1) {
    const type = approverType(text(formData, `stepType-${index}`));
    const name = text(formData, `stepName-${index}`);
    let step: ApprovalStepPayload | null = null;

    if (type === "USER") {
      const userId = Number(text(formData, `stepUserId-${index}`));
      if (!Number.isInteger(userId) || userId <= 0) {
        stepErrors[index] = t.catalog.errors.approverRequired;
      } else {
        step = { approverType: "USER", userId };
      }
    } else if (type === "ROLE") {
      const roleCode = text(formData, `stepRoleCode-${index}`).toUpperCase();
      if (!(APPROVER_ROLE_CODES as string[]).includes(roleCode)) {
        stepErrors[index] = t.catalog.errors.approverRoleRequired;
      } else {
        step = { approverType: "ROLE", roleCode };
      }
    } else if (type === "CLIENT_EMAIL") {
      const clientId = Number(text(formData, `stepClientId-${index}`));
      if (!Number.isInteger(clientId) || clientId <= 0) {
        stepErrors[index] = t.catalog.errors.approverClientRequired;
      } else {
        step = { approverType: "CLIENT_EMAIL", clientId };
      }
    } else {
      stepErrors[index] = t.catalog.errors.approverTypeRequired;
    }

    if (!step) continue;

    const key = approverKey(step);
    if (seen.has(key)) {
      stepErrors[index] = t.catalog.errors.approverDuplicated;
      continue;
    }

    seen.set(key, index);
    steps.push(
      name && step.approverType !== "CLIENT_EMAIL"
        ? { ...step, approverName: name }
        : step,
    );
  }

  if (Object.keys(stepErrors).length) {
    return approvalStepsError(t.catalog.approvals.reviewSteps, stepErrors);
  }

  const projectClientId = Number(formData.get("projectClientId"));

  if (
    Number.isInteger(projectClientId) &&
    projectClientId > 0 &&
    !seen.has(`CLIENT:${projectClientId}`)
  ) {
    return approvalStepsError(t.catalog.errors.projectClientLaneRequired);
  }

  const token = await getSessionToken();
  const result = await apiRequest<ApprovalWorkflowView>(
    `/projects/${projectId}/approval-steps`,
    { method: "PUT", token, body: { steps } },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");

    const message =
      detailCode(result.error.details) === "APPROVER_WITHOUT_PERMISSION"
        ? t.catalog.errors.approverWithoutPermission
        : (errorCopy(result.error.code, t) ??
          result.error.message ??
          t.catalog.errors.fallback);
    const errors = stepErrorsFrom(result.error.details, message);

    return approvalStepsError(
      Object.keys(errors).length ? t.catalog.approvals.reviewSteps : message,
      errors,
    );
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);

  return {
    status: "success",
    message: t.catalog.approvals.saved,
    stepErrors: {},
    steps: result.data.approvalSteps.map((step, index) =>
      toApprovalStepDraft(step, `saved-${index}`),
    ),
    savedAt: Date.now(),
  };
}

function detailCode(details: unknown): string | null {
  if (
    typeof details === "object" &&
    details !== null &&
    "code" in details &&
    typeof (details as { code: unknown }).code === "string"
  ) {
    return (details as { code: string }).code;
  }

  return null;
}

function detailCount(details: unknown, key: string): number {
  if (typeof details !== "object" || details === null || !(key in details)) {
    return 0;
  }

  const value = (details as Record<string, unknown>)[key];
  return typeof value === "number" ? value : 0;
}

function lifecycleError(
  message: string,
  effectiveDateError: string | null = null,
): ProjectLifecycleFormState {
  return {
    status: "error",
    message,
    effectiveDateError,
    summary: null,
  };
}

function closeErrorState(
  result: Extract<ApiResult<unknown>, { ok: false }>,
  t: Dictionary,
): ProjectLifecycleFormState {
  const { code, details } = result.error;

  if (detailCode(details) === "PROJECT_HAS_OPEN_TIMESHEETS") {
    return lifecycleError(
      t.catalog.errors.projectHasOpenTimesheets(
        detailCount(details, "openTimesheets"),
      ),
    );
  }

  if (detailField(details) === "effectiveDate") {
    const message = result.error.message ?? t.catalog.errors.fallback;
    return lifecycleError(t.catalog.form.reviewFields, message);
  }

  if (result.status === 409) {
    return lifecycleError(t.catalog.errors.projectAlreadyClosed);
  }

  return lifecycleError(
    errorCopy(code, t) ?? result.error.message ?? t.catalog.errors.fallback,
  );
}

export async function closeProjectAction(
  _prevState: ProjectLifecycleFormState,
  formData: FormData,
): Promise<ProjectLifecycleFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canManageCatalog(actor)) {
    return lifecycleError(t.catalog.errors.FORBIDDEN);
  }

  const projectId = Number(formData.get("projectId"));
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return lifecycleError(t.catalog.errors.fallback);
  }

  const effectiveDate = text(formData, "effectiveDate");
  if (!effectiveDate) {
    return lifecycleError(
      t.catalog.form.reviewFields,
      t.catalog.errors.effectiveDateRequired,
    );
  }

  const token = await getSessionToken();
  const result = await apiRequest<CloseProjectResult>(
    `/projects/${projectId}/close`,
    { method: "POST", token, body: { effectiveDate } },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return closeErrorState(result, t);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);

  return {
    status: "success",
    message: t.catalog.lifecycle.closed,
    effectiveDateError: null,
    summary: {
      closedAssignments: result.data.closedAssignments,
      strandedTimesheets: result.data.strandedTimesheets,
    },
  };
}

export async function reopenProjectAction(
  _prevState: ProjectLifecycleFormState,
  formData: FormData,
): Promise<ProjectLifecycleFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canManageCatalog(actor)) {
    return lifecycleError(t.catalog.errors.FORBIDDEN);
  }

  const projectId = Number(formData.get("projectId"));
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return lifecycleError(t.catalog.errors.fallback);
  }

  const token = await getSessionToken();
  const result = await apiRequest<{ project: ProjectView }>(
    `/projects/${projectId}/reopen`,
    { method: "POST", token },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    if (result.status === 409) {
      return lifecycleError(t.catalog.errors.projectNotClosed);
    }
    return lifecycleError(
      errorCopy(result.error.code, t) ??
        result.error.message ??
        t.catalog.errors.fallback,
    );
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);

  return {
    status: "success",
    message: t.catalog.lifecycle.reopened,
    effectiveDateError: null,
    summary: null,
  };
}

const MONEY = /^\d{1,10}([.,]\d{1,2})?$/;

function parseRate(value: string): number | null {
  if (!MONEY.test(value)) return null;
  return Number(value.replace(",", "."));
}

function assignmentFieldErrors(
  details: unknown,
): Partial<Record<AssignmentFormField, string>> {
  const errors: Partial<Record<AssignmentFormField, string>> = {};

  for (const issue of readValidationIssues(details)) {
    if (issue.path === "consultantId") errors.consultantId = issue.message;
    if (issue.path === "payRate") errors.payRate = issue.message;
    if (issue.path === "startDate") errors.startDate = issue.message;
    if (issue.path === "endDate") errors.endDate = issue.message;
    if (issue.path === "assignmentCode") errors.assignmentCode = issue.message;
  }

  return errors;
}

function revalidateAssignments(projectId: number, consultantId?: number): void {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/team`);
  revalidatePath("/timesheets");
  if (consultantId) {
    revalidatePath(`/users/${consultantId}`);
    revalidatePath(`/users/${consultantId}/projects`);
  }
}

export async function assignProjectMemberAction(
  _prevState: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canManageCatalog(actor)) {
    return {
      ...INITIAL_ASSIGNMENT_FORM_STATE,
      status: "error",
      message: t.catalog.errors.FORBIDDEN,
    };
  }

  const projectId = Number(formData.get("projectId"));
  const consultantId = Number(formData.get("consultantId"));
  const startDate = text(formData, "startDate");
  const endDate = text(formData, "endDate");
  const rawRate = text(formData, "payRate");
  const rate = rawRate ? parseRate(rawRate) : null;
  const assignmentCode = text(formData, "assignmentCode");

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return {
      ...INITIAL_ASSIGNMENT_FORM_STATE,
      status: "error",
      message: t.catalog.errors.fallback,
    };
  }

  const fieldErrors: Partial<Record<AssignmentFormField, string>> = {};

  if (!Number.isInteger(consultantId) || consultantId <= 0) {
    fieldErrors.consultantId = t.catalog.errors.personRequired;
  }
  if (!startDate) fieldErrors.startDate = t.catalog.errors.assignmentStart;
  if (!rawRate) fieldErrors.payRate = t.catalog.errors.payRateRequired;
  else if (rate === null) fieldErrors.payRate = t.catalog.errors.payRateInvalid;
  if (startDate && endDate && endDate < startDate) {
    fieldErrors.endDate = t.catalog.errors.dateOrder;
  }
  if (assignmentCode.length > ASSIGNMENT_CODE_MAX) {
    fieldErrors.assignmentCode =
      t.catalog.errors.assignmentCodeLength(ASSIGNMENT_CODE_MAX);
  }

  if (Object.keys(fieldErrors).length) {
    return {
      status: "error",
      message: t.catalog.form.reviewFields,
      fieldErrors,
    };
  }

  const token = await getSessionToken();
  const result = await apiRequest<{ assignment: ProjectAssignmentView }>(
    `/projects/${projectId}/assignments`,
    {
      method: "POST",
      token,
      body: {
        consultantId,
        payRate: rate,
        startDate,
        ...(endDate ? { endDate } : {}),
        ...(assignmentCode ? { assignmentCode } : {}),
      },
    },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");

    return {
      status: "error",
      message:
        errorCopy(result.error.code, t) ??
        result.error.message ??
        t.catalog.errors.fallback,
      fieldErrors: assignmentFieldErrors(result.error.details),
    };
  }

  revalidateAssignments(projectId, consultantId);

  return {
    ...INITIAL_ASSIGNMENT_FORM_STATE,
    status: "success",
    message: t.catalog.team.assigned,
  };
}

export async function updateProjectAssignmentAction(
  _prevState: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canManageCatalog(actor)) {
    return {
      ...INITIAL_ASSIGNMENT_FORM_STATE,
      status: "error",
      message: t.catalog.errors.FORBIDDEN,
    };
  }

  const projectId = Number(formData.get("projectId"));
  const assignmentId = Number(formData.get("assignmentId"));
  const consultantId = Number(formData.get("consultantId"));

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(assignmentId) ||
    assignmentId <= 0
  ) {
    return {
      ...INITIAL_ASSIGNMENT_FORM_STATE,
      status: "error",
      message: t.catalog.errors.fallback,
    };
  }

  const reactivate = text(formData, "intent") === "reactivate";
  const startDate = text(formData, "startDate");
  const endDate = text(formData, "endDate");
  const rawRate = text(formData, "payRate");
  const rate = rawRate ? parseRate(rawRate) : null;
  const assignmentCode = text(formData, "assignmentCode");

  const fieldErrors: Partial<Record<AssignmentFormField, string>> = {};

  if (!rawRate) fieldErrors.payRate = t.catalog.errors.payRateRequired;
  else if (rate === null) fieldErrors.payRate = t.catalog.errors.payRateInvalid;
  if (!startDate) fieldErrors.startDate = t.catalog.errors.assignmentStart;
  if (startDate && endDate && endDate < startDate) {
    fieldErrors.endDate = t.catalog.errors.dateOrder;
  }
  if (assignmentCode.length > ASSIGNMENT_CODE_MAX) {
    fieldErrors.assignmentCode =
      t.catalog.errors.assignmentCodeLength(ASSIGNMENT_CODE_MAX);
  }

  if (Object.keys(fieldErrors).length) {
    return {
      status: "error",
      message: t.catalog.form.reviewFields,
      fieldErrors,
    };
  }

  const token = await getSessionToken();
  const result = await apiRequest<{ assignment: ProjectAssignmentView }>(
    `/projects/${projectId}/assignments/${assignmentId}`,
    {
      method: "PATCH",
      token,
      body: {
        payRate: rate,
        startDate,
        endDate: endDate || null,
        assignmentCode: assignmentCode || null,
        ...(reactivate ? { isActive: true } : {}),
      },
    },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");

    return {
      status: "error",
      message:
        errorCopy(result.error.code, t) ??
        result.error.message ??
        t.catalog.errors.fallback,
      fieldErrors: assignmentFieldErrors(result.error.details),
    };
  }

  revalidateAssignments(projectId, consultantId);

  return {
    ...INITIAL_ASSIGNMENT_FORM_STATE,
    status: "success",
    message: t.catalog.team.saved,
  };
}

export async function removeProjectAssignmentAction(
  _prevState: AssignmentRowState,
  formData: FormData,
): Promise<AssignmentRowState> {
  const t = await getDictionary();
  const actor = await requireUser();

  if (!canManageCatalog(actor)) {
    return { status: "error", message: t.catalog.errors.FORBIDDEN };
  }

  const projectId = Number(formData.get("projectId"));
  const assignmentId = Number(formData.get("assignmentId"));
  const consultantId = Number(formData.get("consultantId"));

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(assignmentId) ||
    assignmentId <= 0
  ) {
    return { status: "error", message: t.catalog.errors.fallback };
  }

  const token = await getSessionToken();
  const result = await apiRequest<{ assignment: ProjectAssignmentView }>(
    `/projects/${projectId}/assignments/${assignmentId}`,
    { method: "DELETE", token },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return {
      status: "error",
      message:
        errorCopy(result.error.code, t) ??
        result.error.message ??
        t.catalog.errors.fallback,
    };
  }

  revalidateAssignments(projectId, consultantId);

  return { status: "success", message: t.catalog.team.removed };
}
