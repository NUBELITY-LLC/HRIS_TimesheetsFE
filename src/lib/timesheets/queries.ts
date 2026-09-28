import "server-only";

import { apiRequest } from "@/lib/api/client";
import { fetchAllPages } from "@/lib/api/all-pages";
import type { Pagination } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";
import type {
  Assignment,
  DashboardSummary,
  TeamSummary,
  TeamTimesheet,
  Timesheet,
  TimesheetStatus,
} from "./types";

export const EMPTY_DASHBOARD_SUMMARY: DashboardSummary = {
  monthMinutes: 0,
  monthTargetMinutes: null,
  pendingCount: 0,
  approvedCount: 0,
};

export const EMPTY_TEAM_SUMMARY: TeamSummary = {
  monthMinutes: 0,
  pendingReviewCount: 0,
  approvedCount: 0,
};

export type AssignmentsResult =
  { ok: true; assignments: Assignment[] } | { ok: false; message: string };

export type WeekResult =
  { ok: true; timesheet: Timesheet | null } | { ok: false; message: string };

export async function fetchAssignments(): Promise<AssignmentsResult> {
  const token = await getSessionToken();
  const result = await apiRequest<{ assignments: Assignment[] }>(
    "/timesheets/assignments",
    { token },
  );

  return result.ok
    ? { ok: true, assignments: result.data.assignments }
    : { ok: false, message: result.error.message };
}

export async function fetchWeek(
  assignmentId: number,
  weekStart: string,
): Promise<WeekResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    assignmentId: String(assignmentId),
    weekStart,
  });
  const result = await apiRequest<{ timesheet: Timesheet | null }>(
    `/timesheets/week?${params.toString()}`,
    { token },
  );

  return result.ok
    ? { ok: true, timesheet: result.data.timesheet }
    : { ok: false, message: result.error.message };
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const token = await getSessionToken();
  const result = await apiRequest<{ summary: DashboardSummary }>(
    "/timesheets/summary",
    { token },
  );

  return result.ok ? result.data.summary : EMPTY_DASHBOARD_SUMMARY;
}

export async function fetchRecentSubmissions(
  pageSize = 5,
): Promise<Timesheet[]> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: "1",
    pageSize: String(pageSize),
    status: "sent",
  });
  const result = await apiRequest<Timesheet[]>(
    `/timesheets/mine?${params.toString()}`,
    { token },
  );

  return result.ok ? result.data : [];
}

async function fetchByStatus(
  status: TimesheetStatus,
  pageSize: number,
): Promise<Timesheet[]> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: "1",
    pageSize: String(pageSize),
    status,
  });
  const result = await apiRequest<Timesheet[]>(
    `/timesheets/mine?${params.toString()}`,
    { token },
  );

  return result.ok ? result.data : [];
}

export async function fetchDrafts(pageSize = 10): Promise<Timesheet[]> {
  const [drafts, rejected] = await Promise.all([
    fetchByStatus("DRAFT", pageSize),
    fetchByStatus("REJECTED", pageSize),
  ]);

  return [...drafts, ...rejected]
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    .slice(0, pageSize);
}

export async function fetchTeamSummary(): Promise<TeamSummary> {
  const token = await getSessionToken();
  const result = await apiRequest<{ summary: TeamSummary }>(
    "/timesheets/team/summary",
    { token },
  );

  return result.ok ? result.data.summary : EMPTY_TEAM_SUMMARY;
}

export async function fetchTeamSubmissions(
  pageSize = 8,
): Promise<TeamTimesheet[]> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: "1",
    pageSize: String(pageSize),
    status: "all",
  });

  const result = await apiRequest<TeamTimesheet[]>(
    `/timesheets/team?${params.toString()}`,
    { token },
  );

  return result.ok ? result.data : [];
}

export type HistoryFilters = {
  page: number;
  pageSize: number;
  status: TimesheetStatus | "all";
};

export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  page: 1,
  pageSize: 10,
  status: "all",
};

export type HistoryResult =
  | { ok: true; submissions: Timesheet[]; pagination: Pagination }
  | { ok: false; message: string };

export async function fetchTimesheetHistory(
  filters: HistoryFilters = DEFAULT_HISTORY_FILTERS,
): Promise<HistoryResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    status: filters.status,
  });

  const result = await apiRequest<Timesheet[]>(
    `/timesheets/mine?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    submissions: result.data,
    pagination: result.pagination ?? {
      page: filters.page,
      pageSize: filters.pageSize,
      total: result.data.length,
      totalPages: 1,
    },
  };
}

export async function fetchMyTimesheet(id: number): Promise<Timesheet | null> {
  const token = await getSessionToken();
  const result = await apiRequest<{ timesheet: Timesheet }>(
    `/timesheets/${id}`,
    { token },
  );

  return result.ok ? result.data.timesheet : null;
}

export async function fetchAllTimesheetHistory(
  status: HistoryFilters["status"],
): Promise<{ ok: true; submissions: Timesheet[] } | { ok: false; message: string }> {
  const result = await fetchAllPages(async (page, pageSize) => {
    const response = await fetchTimesheetHistory({ page, pageSize, status });
    return response.ok
      ? { ok: true, items: response.submissions, pagination: response.pagination }
      : response;
  });

  return result.ok ? { ok: true, submissions: result.items } : result;
}

export async function fetchOwnEvidenceLink(
  timesheetId: number,
  attachmentId: number,
): Promise<string | null> {
  const token = await getSessionToken();
  const result = await apiRequest<{ evidence: { url: string } }>(
    `/timesheets/${timesheetId}/attachments/${attachmentId}`,
    { token },
  );

  return result.ok ? result.data.evidence.url : null;
}
