import type { Dictionary } from "@/i18n/dictionaries";

export type PasswordRuleId =
  | "length"
  | "lowercase"
  | "uppercase"
  | "number"
  | "symbol";

export const MIN_PASSWORD_LENGTH = 8;

const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?";

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

export function passwordRuleLabel(
  id: PasswordRuleId,
  t: Dictionary,
): string {
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

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";

function randomInt(max: number): number {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;

  let value = 0xffffffff;
  while (value >= limit) {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  }

  return value % max;
}

function pick(alphabet: string): string {
  return alphabet[randomInt(alphabet.length)];
}

export function generatePassword(length = 16): string {
  const size = Math.max(length, MIN_PASSWORD_LENGTH + 4);
  const alphabet = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;

  const characters = [
    pick(UPPERCASE),
    pick(LOWERCASE),
    pick(DIGITS),
    pick(SYMBOLS),
  ];

  while (characters.length < size) {
    characters.push(pick(alphabet));
  }

  for (let i = characters.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters.join("");
}
