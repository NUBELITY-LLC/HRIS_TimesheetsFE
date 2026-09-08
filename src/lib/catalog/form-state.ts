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
  clientName: string;
  contactEmail: string;
  isActive: boolean;
};

export type ClientFormField = "companyId" | "clientName" | "contactEmail";

export type ClientFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<ClientFormField, string>>;
  values: ClientFormValues;
  savedName: string | null;
};

export const EMPTY_CLIENT_FORM_VALUES: ClientFormValues = {
  companyId: "",
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
  clientId: string;
  projectName: string;
  code: string;
  managerId: string;
  startDate: string;
  endDate: string;
};

export type ProjectFormField =
  | "clientId"
  | "projectName"
  | "code"
  | "managerId"
  | "startDate"
  | "endDate";

export type ProjectFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<ProjectFormField, string>>;
  values: ProjectFormValues;
  savedName: string | null;
};

export const EMPTY_PROJECT_FORM_VALUES: ProjectFormValues = {
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
