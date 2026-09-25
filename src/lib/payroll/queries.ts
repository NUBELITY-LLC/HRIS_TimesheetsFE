import "server-only";

import { apiRequest } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session";
import type { Pagination } from "@/lib/api/types";
import type {
  PayAssignment,
  PayAssignmentFilters,
  PayrollRules,
} from "./pay-terms";

export async function fetchPayrollRules(
  countryCode: string,
): Promise<PayrollRules | null> {
  const token = await getSessionToken();
  const result = await apiRequest<{ rules: PayrollRules }>(
    `/payroll/rules/${countryCode}`,
    { token },
  );

  return result.ok ? result.data.rules : null;
}

export async function fetchConfiguredPayrollRules(): Promise<PayrollRules[]> {
  const token = await getSessionToken();
  const result = await apiRequest<{ rules: PayrollRules[] }>("/payroll/rules", {
    token,
  });

  return result.ok ? result.data.rules : [];
}

export async function fetchPayAssignments(
  filters: PayAssignmentFilters,
): Promise<{ assignments: PayAssignment[]; pagination: Pagination } | null> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: "20",
    status: filters.status,
  });
  if (filters.search) params.set("search", filters.search);
  if (filters.contractType) params.set("contractType", filters.contractType);

  const result = await apiRequest<PayAssignment[]>(
    `/payroll/assignments?${params.toString()}`,
    { token },
  );

  if (!result.ok || !result.pagination) return null;

  return { assignments: result.data, pagination: result.pagination };
}
