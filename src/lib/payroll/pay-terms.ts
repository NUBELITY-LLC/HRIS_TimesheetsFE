import type { Dictionary } from "@/i18n/dictionaries";
import { COUNTRY_CODES, type CountryCode } from "./countries";
import type { RatePeriod } from "@/lib/rates/rates";

export const CONTRACT_TYPES = ["CONTRACTOR", "PAYROLL"] as const;
export type ContractType = (typeof CONTRACT_TYPES)[number];

export type PayBucket =
  "REGULAR" | "SUNDAY" | "OVERTIME" | "OVERTIME_TRIPLE" | "HOLIDAY";

export type PayTerms = {
  contractType: ContractType;
  countryCode: CountryCode;
  hoursDivisor: number;
  dailyHours: number;
  overtimeMultiplier: number;
  holidayMultiplier: number;
};

export type PayLine = {
  bucket: PayBucket;
  minutes: number;
  hours: number;
  multiplier: number;
  amount: number;
};

export type PaySummary = {
  contractType: ContractType;
  countryCode: CountryCode;
  hourlyRate: number;
  minutes: number;
  hours: number;
  amount: number;
  lines: PayLine[];
};

export const DEFAULT_PAY_TERMS: PayTerms = {
  contractType: "CONTRACTOR",
  countryCode: "MX",
  hoursDivisor: 240,
  dailyHours: 8,
  overtimeMultiplier: 2,
  holidayMultiplier: 2,
};

const NUMBER = /^\d{1,4}([.,]\d{1,2})?$/;

type NumericField =
  "hoursDivisor" | "dailyHours" | "overtimeMultiplier" | "holidayMultiplier";

const RANGES: Record<NumericField, { min: number; max: number }> = {
  hoursDivisor: { min: 1, max: 1000 },
  dailyHours: { min: 1, max: 24 },
  overtimeMultiplier: { min: 1, max: 10 },
  holidayMultiplier: { min: 1, max: 10 },
};

function oneOf<T extends string>(
  values: readonly T[],
  value: string,
): T | null {
  return (values as readonly string[]).includes(value) ? (value as T) : null;
}

export function readPayTerms(
  formData: FormData,
  t: Dictionary,
): { terms: Partial<PayTerms>; error: string | null } {
  const terms: Partial<PayTerms> = {};

  const contractType = formData.get("contractType");
  if (typeof contractType === "string" && contractType) {
    const value = oneOf(CONTRACT_TYPES, contractType);
    if (!value) return { terms, error: t.payTerms.errors.contractType };
    terms.contractType = value;
  }

  const countryCode = formData.get("countryCode");
  if (typeof countryCode === "string" && countryCode) {
    const value = oneOf(COUNTRY_CODES, countryCode);
    if (!value) return { terms, error: t.payTerms.errors.country };
    terms.countryCode = value;
  }

  for (const field of Object.keys(RANGES) as NumericField[]) {
    const raw = formData.get(field);
    if (typeof raw !== "string" || !raw.trim()) continue;

    const normalized = raw.trim();
    const value = NUMBER.test(normalized)
      ? Number(normalized.replace(",", "."))
      : Number.NaN;
    const { min, max } = RANGES[field];

    if (!Number.isFinite(value) || value < min || value > max) {
      return { terms, error: t.payTerms.errors[field](min, max) };
    }

    terms[field] = value;
  }

  return { terms, error: null };
}

export function isPayTermsIssue(path: string): boolean {
  return /(^|\.)(contractType|countryCode|hoursDivisor|dailyHours|overtimeMultiplier|holidayMultiplier)$/.test(
    path,
  );
}

export function payTermsChanged(data: FormData, terms: PayTerms): boolean {
  return (Object.keys(terms) as (keyof PayTerms)[]).some((field) => {
    const raw = data.get(field);
    if (typeof raw !== "string") return false;

    const current = terms[field];
    return typeof current === "number"
      ? Number(raw.trim().replace(",", ".")) !== current
      : raw !== current;
  });
}

export type PayrollRules = {
  countryCode: string;
  configured: boolean;
  updatedAt: string | null;
  overtimeMultiplier: number;
  overtimeTripleMultiplier: number;
  weeklyDoubleOvertimeHours: number | null;
  holidayMultiplier: number;
  sundayMultiplier: number;
};

export type PayrollRulesField =
  | "overtimeMultiplier"
  | "weeklyDoubleOvertimeHours"
  | "overtimeTripleMultiplier"
  | "holidayMultiplier"
  | "sundayPremiumPercent";

export type PayrollRulesFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  values: Partial<Record<PayrollRulesField, string>> | null;
};

export const INITIAL_PAYROLL_RULES_FORM_STATE: PayrollRulesFormState = {
  status: "idle",
  message: null,
  values: null,
};

export function sundayPremiumPercent(multiplier: number): number {
  return Math.round((multiplier - 1) * 100);
}

export type PayAssignment = {
  id: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  assignmentCode: string | null;
  payRate: number;
  ratePeriod: RatePeriod;
  currency: string;
  hourlyRate: number;
  payTerms: PayTerms;
  consultant: { id: number; name: string; email: string } | null;
  project: { id: number; name: string; code: string | null } | null;
  client: { id: number; name: string } | null;
};

export type PayAssignmentFilters = {
  page: number;
  search: string;
  contractType: "" | ContractType;
  status: "active" | "inactive" | "all";
};

export type PayTermsRowState = {
  status: "idle" | "success" | "error";
  message: string | null;
  savedAt: number | null;
};

export const INITIAL_PAY_TERMS_ROW_STATE: PayTermsRowState = {
  status: "idle",
  message: null,
  savedAt: null,
};
