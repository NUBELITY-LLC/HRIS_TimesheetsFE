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
  remainingAttempts?: number;
  lockedUntil?: string;
  retryAfterSeconds?: number;
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

  const { remainingAttempts, lockedUntil, retryAfterSeconds } = details;

  return {
    remainingAttempts:
      typeof remainingAttempts === "number" ? remainingAttempts : undefined,
    lockedUntil: typeof lockedUntil === "string" ? lockedUntil : undefined,
    retryAfterSeconds:
      typeof retryAfterSeconds === "number" ? retryAfterSeconds : undefined,
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
