export type ChangePasswordField =
  | "currentPassword"
  | "newPassword"
  | "confirmPassword";

export type ChangePasswordFormState = {
  message: string | null;
  code: string | null;
  fieldErrors: Partial<Record<ChangePasswordField, string>>;
};

export const INITIAL_CHANGE_PASSWORD_STATE: ChangePasswordFormState = {
  message: null,
  code: null,
  fieldErrors: {},
};
