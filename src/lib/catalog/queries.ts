import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { Pagination, UserView } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";
import { ROLE_ADMIN, ROLE_PM } from "@/lib/users/roles";
import type { ClientView, CompanyView, PersonView, ProjectView } from "./types";

export type CatalogStatus = "active" | "inactive" | "all";

export type CompanyFilters = {
  page: number;
  pageSize: number;
  search: string;
  status: CatalogStatus;
};

export const DEFAULT_COMPANY_FILTERS: CompanyFilters = {
  page: 1,
  pageSize: 20,
  search: "",
  status: "active",
};

export type ClientFilters = {
  page: number;
  pageSize: number;
  search: string;
  companyId: string;
  status: CatalogStatus;
};

export const DEFAULT_CLIENT_FILTERS: ClientFilters = {
  page: 1,
  pageSize: 20,
  search: "",
  companyId: "",
  status: "active",
};

export type ProjectFilters = {
  page: number;
  pageSize: number;
  search: string;
  clientId: string;
};

export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  page: 1,
  pageSize: 20,
  search: "",
  clientId: "",
};

export type CompanyListResult =
  | { ok: true; companies: CompanyView[]; pagination: Pagination }
  | { ok: false; message: string };

export type ClientListResult =
  | { ok: true; clients: ClientView[]; pagination: Pagination }
  | { ok: false; message: string };

export type ProjectListResult =
  | { ok: true; projects: ProjectView[]; pagination: Pagination }
  | { ok: false; message: string };

function fallbackPagination(
  page: number,
  pageSize: number,
  total: number,
): Pagination {
  return { page, pageSize, total, totalPages: 1 };
}

export async function fetchCompanies(
  filters: CompanyFilters,
): Promise<CompanyListResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    status: filters.status,
  });
  if (filters.search) params.set("search", filters.search);

  const result = await apiRequest<CompanyView[]>(
    `/companies?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    companies: result.data,
    pagination:
      result.pagination ??
      fallbackPagination(filters.page, filters.pageSize, result.data.length),
  };
}

export async function fetchActiveCompanies(): Promise<CompanyView[]> {
  const result = await fetchCompanies({
    page: 1,
    pageSize: 100,
    search: "",
    status: "active",
  });

  return result.ok ? result.companies : [];
}

export async function fetchCompany(id: number): Promise<CompanyView | null> {
  const token = await getSessionToken();
  const result = await apiRequest<{ company: CompanyView }>(
    `/companies/${id}`,
    { token },
  );

  return result.ok ? result.data.company : null;
}

export async function fetchClients(
  filters: ClientFilters,
): Promise<ClientListResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    status: filters.status,
  });
  if (filters.search) params.set("search", filters.search);
  if (filters.companyId) params.set("companyId", filters.companyId);

  const result = await apiRequest<ClientView[]>(`/clients?${params.toString()}`, {
    token,
  });

  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    clients: result.data,
    pagination:
      result.pagination ??
      fallbackPagination(filters.page, filters.pageSize, result.data.length),
  };
}

export async function fetchActiveClients(): Promise<ClientView[]> {
  const result = await fetchClients({
    page: 1,
    pageSize: 100,
    search: "",
    companyId: "",
    status: "active",
  });

  return result.ok ? result.clients : [];
}

export async function fetchClient(id: number): Promise<ClientView | null> {
  const token = await getSessionToken();
  const result = await apiRequest<{ client: ClientView }>(`/clients/${id}`, {
    token,
  });

  return result.ok ? result.data.client : null;
}

export async function fetchProjects(
  filters: ProjectFilters,
): Promise<ProjectListResult> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  });
  if (filters.search) params.set("search", filters.search);
  if (filters.clientId) params.set("clientId", filters.clientId);

  const result = await apiRequest<ProjectView[]>(
    `/projects?${params.toString()}`,
    { token },
  );

  if (!result.ok) return { ok: false, message: result.error.message };

  return {
    ok: true,
    projects: result.data,
    pagination:
      result.pagination ??
      fallbackPagination(filters.page, filters.pageSize, result.data.length),
  };
}

export async function fetchAllProjects(): Promise<ProjectView[]> {
  const result = await fetchProjects({
    page: 1,
    pageSize: 100,
    search: "",
    clientId: "",
  });

  return result.ok ? result.projects : [];
}

export async function fetchProject(id: number): Promise<ProjectView | null> {
  const token = await getSessionToken();
  const result = await apiRequest<{ project: ProjectView }>(`/projects/${id}`, {
    token,
  });

  return result.ok ? result.data.project : null;
}

async function fetchUsersByRole(roleCode: string): Promise<UserView[]> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: "1",
    pageSize: "100",
    status: "active",
    roleCode,
    sortBy: "fullName",
    sortDir: "asc",
  });

  const result = await apiRequest<UserView[]>(`/users?${params.toString()}`, {
    token,
  });

  return result.ok ? result.data : [];
}

export async function fetchProjectManagers(): Promise<PersonView[]> {
  const [admins, managers] = await Promise.all([
    fetchUsersByRole(ROLE_ADMIN),
    fetchUsersByRole(ROLE_PM),
  ]);

  return [...managers, ...admins].map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roleCode: user.role.code,
    isActive: user.isActive,
  }));
}
