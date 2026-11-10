import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { EvidenceFile } from "@/lib/api/download";
import type { Pagination } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";
import type {
  FeedbackCase,
  FeedbackFilters,
  FeedbackListItem,
  FeedbackReport,
} from "./types";

export const FEEDBACK_PAGE_SIZE = 20;

function rangeParams(filters: Pick<FeedbackFilters, "from" | "to" | "category">) {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.category) params.set("categories", filters.category);
  return params;
}

export type FeedbackCasesResult =
  | { ok: true; items: FeedbackListItem[]; pagination: Pagination }
  | { ok: false; message: string };

export async function fetchFeedbackCases(filters: FeedbackFilters): Promise<FeedbackCasesResult> {
  const token = await getSessionToken();
  const params = rangeParams(filters);
  if (filters.status) params.set("statuses", filters.status);
  params.set("page", String(filters.page));
  params.set("pageSize", String(FEEDBACK_PAGE_SIZE));

  const result = await apiRequest<FeedbackListItem[]>(`/feedback/cases?${params}`, { token });
  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    items: result.data,
    pagination: result.pagination ?? {
      page: filters.page,
      pageSize: FEEDBACK_PAGE_SIZE,
      total: result.data.length,
      totalPages: 1,
    },
  };
}

export async function fetchNewFeedbackCount(): Promise<number> {
  const token = await getSessionToken();
  const result = await apiRequest<{ newCount: number }>("/feedback/cases/summary", { token });
  return result.ok ? result.data.newCount : 0;
}

export type FeedbackCaseResult =
  | { ok: true; feedbackCase: FeedbackCase }
  | { ok: false; notFound: boolean; message: string };

export async function fetchFeedbackCase(id: number): Promise<FeedbackCaseResult> {
  const token = await getSessionToken();
  const result = await apiRequest<{ case: FeedbackCase }>(`/feedback/cases/${id}`, { token });

  if (!result.ok) {
    return { ok: false, notFound: result.status === 404, message: result.error.message };
  }
  return { ok: true, feedbackCase: result.data.case };
}

export type FeedbackReportResult =
  | { ok: true; report: FeedbackReport }
  | { ok: false; message: string };

export async function fetchFeedbackReport(
  filters: Pick<FeedbackFilters, "from" | "to" | "category">,
): Promise<FeedbackReportResult> {
  const token = await getSessionToken();
  const result = await apiRequest<{ report: FeedbackReport }>(
    `/feedback/cases/report?${rangeParams(filters)}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };
  return { ok: true, report: result.data.report };
}

export async function fetchFeedbackEvidence(
  id: number,
  attachmentId: number,
): Promise<EvidenceFile | null> {
  const token = await getSessionToken();
  const result = await apiRequest<EvidenceFile>(
    `/feedback/cases/${id}/evidence/${attachmentId}`,
    { token },
  );

  return result.ok ? result.data : null;
}
