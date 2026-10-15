export type AccountLinkPurpose = "INVITE" | "RESET";

export type SetPasswordField = "password" | "confirmPassword";

export type SetPasswordFormState = {
  message: string | null;
  code: string | null;
  fieldErrors: Partial<Record<SetPasswordField, string>>;
};

export const INITIAL_SET_PASSWORD_STATE: SetPasswordFormState = {
  message: null,
  code: null,
  fieldErrors: {},
};

export type ForgotPasswordFormState = {
  status: "idle" | "sent" | "error";
  message: string | null;
  email: string;
  fieldError: string | null;
};

export const INITIAL_FORGOT_PASSWORD_STATE: ForgotPasswordFormState = {
  status: "idle",
  message: null,
  email: "",
  fieldError: null,
};

export const ACCOUNT_LINK_ENDPOINTS: Record<
  AccountLinkPurpose,
  { describe: (token: string) => string; complete: (token: string) => string }
> = {
  INVITE: {
    describe: (token) => `/auth/invitations/${encodeURIComponent(token)}`,
    complete: (token) => `/auth/invitations/${encodeURIComponent(token)}/accept`,
  },
  RESET: {
    describe: (token) => `/auth/password-resets/${encodeURIComponent(token)}`,
    complete: (token) => `/auth/password-resets/${encodeURIComponent(token)}`,
  },
};
