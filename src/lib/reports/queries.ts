import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { Pagination } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";
import type { HoursReport, ReportPerson } from "./types";

export const PEOPLE_STATUSES = ["active", "inactive", "all"] as const;

export type PeopleStatus = (typeof PEOPLE_STATUSES)[number];

export type PeopleFilters = {
  page: number;
  pageSize: number;
  search: string;
  status: PeopleStatus;
};

export const DEFAULT_PEOPLE_FILTERS: PeopleFilters = {
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

export type HoursReportResult =
  { ok: true; report: HoursReport } | { ok: false; message: string };

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
): Promise<HoursReportResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    userId: String(userId),
    from: range.from,
    to: range.to,
  });

  const result = await apiRequest<{ report: HoursReport }>(
    `/reports/hours?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return { ok: true, report: result.data.report };
}
