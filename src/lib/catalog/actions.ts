"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDictionary } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import { apiRequest, type ApiResult } from "@/lib/api/client";
import { readValidationIssues } from "@/lib/api/types";
import { getSessionToken, requireUser } from "@/lib/auth/session";
import { canManageCatalog } from "@/lib/users/roles";
import {
  type ClientFormField,
  type ClientFormState,
  type ClientFormValues,
  type CompanyFormField,
  type CompanyFormState,
  type CompanyFormValues,
  type ProjectFormField,
  type ProjectFormState,
  type ProjectFormValues,
} from "./form-state";
import type { ClientView, CompanyView, ProjectView } from "./types";

const COMPANY_FIELDS: CompanyFormField[] = ["legalName", "tradeName", "rfc"];
const CLIENT_FIELDS: ClientFormField[] = [
  "companyId",
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
    | string
    | undefined;
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

  if (!canManageCatalog(actor.role.code)) {
    return {
      status: "error",
      message: t.catalog.errors.FORBIDDEN,
      fieldErrors: {},
      values,
      savedName: null,
    };
  }

  const fieldErrors: Partial<Record<CompanyFormField, string>> = {};
  if (!values.legalName) fieldErrors.legalName = t.catalog.errors.legalNameRequired;
  if (!values.tradeName) fieldErrors.tradeName = t.catalog.errors.tradeNameRequired;
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
  revalidatePath("/clients");
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
    clientName: text(formData, "clientName"),
    contactEmail: text(formData, "contactEmail"),
    isActive: formData.get("isActive") !== null,
  };

  if (!canManageCatalog(actor.role.code)) {
    return {
      status: "error",
      message: t.catalog.errors.FORBIDDEN,
      fieldErrors: {},
      values,
      savedName: null,
    };
  }

  const companyId = Number(values.companyId);
  const fieldErrors: Partial<Record<ClientFormField, string>> = {};

  if (!Number.isInteger(companyId) || companyId <= 0) {
    fieldErrors.companyId = t.catalog.errors.companyRequired;
  }
  if (!values.clientName) {
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

  const id = entityId(formData);
  const token = await getSessionToken();
  const body = {
    companyId,
    clientName: values.clientName,
    contactEmail: values.contactEmail || null,
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

  revalidatePath("/clients");
  revalidatePath("/projects");
  if (id) revalidatePath(`/clients/${id}`);

  const client = result.data.client;

  return {
    status: "success",
    message: null,
    fieldErrors: {},
    values: {
      companyId: client.company ? String(client.company.id) : "",
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

  const values: ProjectFormValues = {
    clientId: text(formData, "clientId"),
    projectName: text(formData, "projectName"),
    code: text(formData, "code"),
    managerId: text(formData, "managerId"),
    startDate: text(formData, "startDate"),
    endDate: text(formData, "endDate"),
  };

  if (!canManageCatalog(actor.role.code)) {
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
    endDate: values.endDate || null,
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

  return {
    status: "success",
    message: null,
    fieldErrors: {},
    values: {
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
