export type UserFormField =
  | "fullName"
  | "userName"
  | "email"
  | "password"
  | "roleCode"
  | "jobTitle"
  | "projectId"
  | "projectPayRate"
  | "projectStartDate"
  | "projectEndDate";

export type UserFormValues = {
  fullName: string;
  userName: string;
  email: string;
  roleCode: string;
  jobTitle: string;
  isActive: boolean;
  projectId: string;
  projectPayRate: string;
  projectStartDate: string;
  projectEndDate: string;
};

export type UserFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  code: string | null;
  fieldErrors: Partial<Record<UserFormField, string>>;
  values: UserFormValues;
  savedUser: {
    fullName: string;
    userName: string;
    email: string;
    roleName: string;
  } | null;
};

export const EMPTY_USER_FORM_VALUES: UserFormValues = {
  fullName: "",
  userName: "",
  email: "",
  roleCode: "",
  jobTitle: "",
  isActive: true,
  projectId: "",
  projectPayRate: "",
  projectStartDate: "",
  projectEndDate: "",
};

export const INITIAL_USER_FORM_STATE: UserFormState = {
  status: "idle",
  message: null,
  code: null,
  fieldErrors: {},
  values: EMPTY_USER_FORM_VALUES,
  savedUser: null,
};

export type UserProjectFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<
    Record<"projectId" | "payRate" | "startDate" | "endDate", string>
  >;
};

export const INITIAL_USER_PROJECT_FORM_STATE: UserProjectFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export type RowActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const INITIAL_ROW_ACTION_STATE: RowActionState = {
  status: "idle",
  message: null,
};
