import "server-only";

import { apiRequest } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session";
import type {
  Assignment,
  DashboardSummary,
  TeamSummary,
  TeamTimesheet,
  Timesheet,
  TimesheetReview,
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
  | { ok: true; assignments: Assignment[] }
  | { ok: false; message: string };

export type WeekResult =
  | { ok: true; timesheet: Timesheet | null }
  | { ok: false; message: string };

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
    status: "all",
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
  return EMPTY_TEAM_SUMMARY;
}

export async function fetchTeamSubmissions(): Promise<TeamTimesheet[]> {
  return [];
}

export async function fetchPendingReviews(): Promise<TeamTimesheet[]> {
  return [];
}

export async function fetchTimesheetReview(
  id: string,
): Promise<TimesheetReview | null> {
  return REVIEWS.get(id) ?? null;
}

const REVIEWS = new Map<string, TimesheetReview>();
