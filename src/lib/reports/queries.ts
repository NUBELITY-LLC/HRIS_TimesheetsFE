import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { Pagination } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";
import { COMPANY_FILTER_KEYS, EMPTY_COMPANY_FILTERS } from "./scope";
import type {
  CompanyFilters,
  CompanyReport,
  HoursReport,
  ReportPerson,
  ReportScopes,
} from "./types";

export const PEOPLE_STATUSES = ["active", "inactive", "all"] as const;

export type PeopleStatus = (typeof PEOPLE_STATUSES)[number];

export type ReportScope = {
  companyId: string;
  projectId: string;
};

export const EMPTY_SCOPE: ReportScope = { companyId: "", projectId: "" };

export type PeopleFilters = ReportScope & {
  page: number;
  pageSize: number;
  search: string;
  status: PeopleStatus;
};

export const DEFAULT_PEOPLE_FILTERS: PeopleFilters = {
  ...EMPTY_SCOPE,
  page: 1,
  pageSize: 20,
  search: "",
  status: "active",
};

export type ReportRange = {
  from: string;
  to: string;
};

export type PeopleResult =
  | { ok: true; people: ReportPerson[]; pagination: Pagination }
  | { ok: false; message: string };

export type CompanyReportResult =
  { ok: true; report: CompanyReport } | { ok: false; message: string };

export type HoursReportResult =
  { ok: true; report: HoursReport } | { ok: false; message: string };

export function setScopeParams(
  params: URLSearchParams,
  scope: ReportScope,
): URLSearchParams {
  if (scope.companyId) params.set("companyId", scope.companyId);
  if (scope.projectId) params.set("projectId", scope.projectId);

  return params;
}

export async function fetchReportScopes(): Promise<ReportScopes> {
  const token = await getSessionToken();
  const result = await apiRequest<ReportScopes>("/reports/scopes", { token });

  return result.ok ? result.data : { companies: [], projects: [] };
}

export async function fetchReportPeople(
  filters: PeopleFilters = DEFAULT_PEOPLE_FILTERS,
): Promise<PeopleResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    status: filters.status,
  });

  if (filters.search) params.set("search", filters.search);
  setScopeParams(params, filters);

  const result = await apiRequest<ReportPerson[]>(
    `/reports/people?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    people: result.data,
    pagination: result.pagination ?? {
      page: filters.page,
      pageSize: filters.pageSize,
      total: result.data.length,
      totalPages: 1,
    },
  };
}

export async function fetchHoursReport(
  userId: number,
  range: ReportRange,
  scope: ReportScope = EMPTY_SCOPE,
): Promise<HoursReportResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    userId: String(userId),
    from: range.from,
    to: range.to,
  });
  setScopeParams(params, scope);

  const result = await apiRequest<{ report: HoursReport }>(
    `/reports/hours?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return { ok: true, report: result.data.report };
}

export async function fetchCompanyReport(
  companyId: number,
  range: ReportRange,
  filters: CompanyFilters = EMPTY_COMPANY_FILTERS,
): Promise<CompanyReportResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    companyId: String(companyId),
    from: range.from,
    to: range.to,
  });
  for (const key of COMPANY_FILTER_KEYS) {
    const value = filters[key];
    if (value) params.set(key, value);
  }

  const result = await apiRequest<{ report: CompanyReport }>(
    `/reports/company?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return { ok: true, report: result.data.report };
}
