import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { Pagination } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";
import type { AppNotification, NotificationStatusFilter } from "./types";

export type NotificationFilters = {
  page: number;
  pageSize: number;
  status: NotificationStatusFilter;
};

export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilters = {
  page: 1,
  pageSize: 20,
  status: "all",
};

export type NotificationsResult =
  | { ok: true; notifications: AppNotification[]; pagination: Pagination }
  | { ok: false; message: string };

export async function fetchNotifications(
  filters: NotificationFilters = DEFAULT_NOTIFICATION_FILTERS,
): Promise<NotificationsResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    status: filters.status,
  });

  const result = await apiRequest<AppNotification[]>(
    `/notifications?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    notifications: result.data,
    pagination: result.pagination ?? {
      page: filters.page,
      pageSize: filters.pageSize,
      total: result.data.length,
      totalPages: 1,
    },
  };
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const token = await getSessionToken();
  const result = await apiRequest<{ unread: number }>(
    "/notifications/unread-count",
    { token },
  );

  return result.ok ? result.data.unread : 0;
}
