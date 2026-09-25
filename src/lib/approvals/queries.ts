import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { Pagination } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";
import type {
  ApprovalDecisionHistory,
  ApprovalDetail,
  PendingApproval,
} from "./types";

export type PendingApprovalFilters = {
  page: number;
  pageSize: number;
};

export const DEFAULT_PENDING_APPROVAL_FILTERS: PendingApprovalFilters = {
  page: 1,
  pageSize: 10,
};

export type PendingApprovalsResult =
  | { ok: true; approvals: PendingApproval[]; pagination: Pagination }
  | { ok: false; message: string };

export async function fetchPendingApprovals(
  filters: PendingApprovalFilters = DEFAULT_PENDING_APPROVAL_FILTERS,
): Promise<PendingApprovalsResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  });

  const result = await apiRequest<PendingApproval[]>(
    `/approvals/pending?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    approvals: result.data,
    pagination: result.pagination ?? {
      page: filters.page,
      pageSize: filters.pageSize,
      total: result.data.length,
      totalPages: 1,
    },
  };
}

export async function fetchPendingApprovalCount(): Promise<number> {
  const result = await fetchPendingApprovals({ page: 1, pageSize: 1 });
  return result.ok ? result.pagination.total : 0;
}

export type PendingApprovalIndex = {
  total: number;
  approvalIdByTimesheet: ReadonlyMap<number, number>;
};

const PENDING_INDEX_PAGE_SIZE = 50;
const PENDING_INDEX_MAX_PAGES = 10;

export async function fetchPendingApprovalIndex(): Promise<PendingApprovalIndex> {
  const first = await fetchPendingApprovals({
    page: 1,
    pageSize: PENDING_INDEX_PAGE_SIZE,
  });

  if (!first.ok) return { total: 0, approvalIdByTimesheet: new Map() };

  const approvals = [...first.approvals];
  const lastPage = Math.min(
    first.pagination.totalPages,
    PENDING_INDEX_MAX_PAGES,
  );

  if (lastPage > 1) {
    const rest = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, index) =>
        fetchPendingApprovals({
          page: index + 2,
          pageSize: PENDING_INDEX_PAGE_SIZE,
        }),
      ),
    );

    for (const result of rest) {
      if (result.ok) approvals.push(...result.approvals);
    }
  }

  const approvalIdByTimesheet = new Map<number, number>();

  for (const approval of approvals) {
    if (!approvalIdByTimesheet.has(approval.timesheetId)) {
      approvalIdByTimesheet.set(approval.timesheetId, approval.approvalId);
    }
  }

  return { total: first.pagination.total, approvalIdByTimesheet };
}

export async function fetchApprovalDetail(
  approvalId: number,
): Promise<ApprovalDetail | null> {
  const token = await getSessionToken();
  const result = await apiRequest<{ approval: ApprovalDetail }>(
    `/approvals/${approvalId}`,
    { token },
  );

  if (!result.ok) return null;

  return result.data.approval;
}

export async function fetchEvidenceLink(
  approvalId: number,
  attachmentId: number,
): Promise<string | null> {
  const token = await getSessionToken();
  const result = await apiRequest<{
    evidence: { url: string; fileName: string; mimeType: string };
  }>(`/approvals/${approvalId}/attachments/${attachmentId}`, { token });

  if (!result.ok) return null;

  return result.data.evidence.url;
}

export type DecisionHistoryResult =
  | { ok: true; decisions: ApprovalDecisionHistory[]; pagination: Pagination }
  | { ok: false; message: string };

export async function fetchDecisionHistory(
  filters: PendingApprovalFilters = DEFAULT_PENDING_APPROVAL_FILTERS,
): Promise<DecisionHistoryResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  });

  const result = await apiRequest<ApprovalDecisionHistory[]>(
    `/approvals/history?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    decisions: result.data,
    pagination: result.pagination ?? {
      page: filters.page,
      pageSize: filters.pageSize,
      total: result.data.length,
      totalPages: 1,
    },
  };
}
