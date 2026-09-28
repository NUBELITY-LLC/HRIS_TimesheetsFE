import type { PayTerms } from "@/lib/payroll/pay-terms";
import type { RatePeriod } from "@/lib/rates/rates";
import type { RateChangeView } from "@/lib/catalog/types";

export type Role = {
  id: number;
  code: string;
  name: string;
};

export type AuthenticatedUser = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  jobTitle: string | null;
  lastLoginAt: string | null;
  mustChangePassword: boolean;
  role: Role;
  permissions: string[];
};

export type LoginResult = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  expiresAt: string;
  user: AuthenticatedUser;
};

export type UserView = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  jobTitle: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  role: Role;
  permissions: string[];
};

export type UserProjectView = {
  assignmentId: number;
  payRate: number;
  ratePeriod: RatePeriod;
  rateChanges: RateChangeView[];
  currency: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  assignmentCode: string | null;
  payTerms: PayTerms;
  project: {
    id: number;
    projectName: string;
    code: string | null;
    startDate: string | null;
    endDate: string | null;
    client: { id: number; name: string; isActive: boolean } | null;
  } | null;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ApiErrorPayload = {
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
};

export type AttemptDetails = {
  lockedUntil?: string;
};

export type ValidationIssue = {
  path: string;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readAttemptDetails(details: unknown): AttemptDetails {
  if (!isRecord(details)) return {};

  const { lockedUntil } = details;

  return {
    lockedUntil: typeof lockedUntil === "string" ? lockedUntil : undefined,
  };
}

export function readPagination(value: unknown): Pagination | null {
  if (!isRecord(value)) return null;

  const { page, pageSize, total, totalPages } = value;
  if (
    typeof page !== "number" ||
    typeof pageSize !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    return null;
  }

  return { page, pageSize, total, totalPages };
}

export function readValidationIssues(details: unknown): ValidationIssue[] {
  if (!Array.isArray(details)) return [];

  return details.flatMap((issue) => {
    if (!isRecord(issue)) return [];
    const { path, message } = issue;
    if (typeof path !== "string" || typeof message !== "string") return [];
    return [{ path, message }];
  });
}
