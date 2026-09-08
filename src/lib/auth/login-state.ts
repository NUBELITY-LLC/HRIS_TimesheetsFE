export type LoginFormState = {
  message: string | null;
  code: string | null;
  lockedUntil: string | null;
  fieldErrors: {
    username?: string;
    password?: string;
  };
  username: string;
};

export const INITIAL_LOGIN_STATE: LoginFormState = {
  message: null,
  code: null,
  lockedUntil: null,
  fieldErrors: {},
  username: "",
};
