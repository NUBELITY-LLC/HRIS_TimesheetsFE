import type { Dictionary } from "@/i18n/dictionaries";

export type PasswordRuleId =
  "length" | "lowercase" | "uppercase" | "number" | "symbol";

export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_RULES: Array<{
  id: PasswordRuleId;
  test: (password: string) => boolean;
}> = [
  { id: "length", test: (password) => password.length >= MIN_PASSWORD_LENGTH },
  { id: "lowercase", test: (password) => /[a-z]/.test(password) },
  { id: "uppercase", test: (password) => /[A-Z]/.test(password) },
  { id: "number", test: (password) => /[0-9]/.test(password) },
  { id: "symbol", test: (password) => /[^A-Za-z0-9\s]/.test(password) },
];

export function passwordRuleLabel(id: PasswordRuleId, t: Dictionary): string {
  return id === "length"
    ? t.password.rules.length(MIN_PASSWORD_LENGTH)
    : t.password.rules[id];
}

export function unmetPasswordRuleIds(password: string): PasswordRuleId[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map(
    (rule) => rule.id,
  );
}

export function isPasswordValid(password: string): boolean {
  return unmetPasswordRuleIds(password).length === 0;
}

export function passwordPolicyError(
  password: string,
  t: Dictionary,
): string | null {
  if (!password) return t.password.required;

  const unmet = unmetPasswordRuleIds(password);
  if (unmet.length === 0) return null;

  return t.password.needs(unmet.map((id) => passwordRuleLabel(id, t)));
}
