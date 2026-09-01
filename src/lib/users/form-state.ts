export type UserFormField =
  | "fullName"
  | "userName"
  | "email"
  | "password"
  | "roleCode"
  | "jobTitle";

export type UserFormValues = {
  fullName: string;
  userName: string;
  email: string;
  roleCode: string;
  jobTitle: string;
  isActive: boolean;
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
};

export const INITIAL_USER_FORM_STATE: UserFormState = {
  status: "idle",
  message: null,
  code: null,
  fieldErrors: {},
  values: EMPTY_USER_FORM_VALUES,
  savedUser: null,
};

export type RowActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const INITIAL_ROW_ACTION_STATE: RowActionState = {
  status: "idle",
  message: null,
};
