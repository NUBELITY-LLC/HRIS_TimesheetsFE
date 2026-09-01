import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { Pagination, UserView } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";

export const USER_STATUSES = ["active", "inactive", "all"] as const;
export const USER_SORT_FIELDS = [
  "fullName",
  "userName",
  "email",
  "lastLoginAt",
  "id",
] as const;
export const USER_SORT_DIRECTIONS = ["asc", "desc"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];
export type UserSortField = (typeof USER_SORT_FIELDS)[number];
export type UserSortDirection = (typeof USER_SORT_DIRECTIONS)[number];

export type UserListFilters = {
  page: number;
  pageSize: number;
  search: string;
  roleCode: string;
  status: UserStatus;
  sortBy: UserSortField;
  sortDir: UserSortDirection;
};

export const DEFAULT_USER_FILTERS: UserListFilters = {
  page: 1,
  pageSize: 20,
  search: "",
  roleCode: "",
  status: "all",
  sortBy: "fullName",
  sortDir: "asc",
};

export type UserListResult =
  | { ok: true; users: UserView[]; pagination: Pagination }
  | { ok: false; message: string };

function buildQuery(filters: UserListFilters): string {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    status: filters.status,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });

  if (filters.search) params.set("search", filters.search);
  if (filters.roleCode) params.set("roleCode", filters.roleCode);

  return params.toString();
}

export async function fetchUsers(
  filters: UserListFilters,
): Promise<UserListResult> {
  const token = await getSessionToken();
  const result = await apiRequest<UserView[]>(`/users?${buildQuery(filters)}`, {
    token,
  });

  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }

  return {
    ok: true,
    users: result.data,
    pagination: result.pagination ?? {
      page: filters.page,
      pageSize: filters.pageSize,
      total: result.data.length,
      totalPages: 1,
    },
  };
}

export type UserFetchResult =
  | { ok: true; user: UserView }
  | { ok: false; reason: "not-found" }
  | { ok: false; reason: "forbidden"; message: string };

export async function fetchUser(id: number): Promise<UserFetchResult> {
  const token = await getSessionToken();
  const result = await apiRequest<{ user: UserView }>(`/users/${id}`, { token });

  if (result.ok) return { ok: true, user: result.data.user };
  if (result.status === 403) {
    return { ok: false, reason: "forbidden", message: result.error.message };
  }
  return { ok: false, reason: "not-found" };
}
