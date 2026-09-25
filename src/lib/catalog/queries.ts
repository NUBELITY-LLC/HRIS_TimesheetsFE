import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { Pagination, UserView } from "@/lib/api/types";
import { getSessionToken } from "@/lib/auth/session";
import {
  MANAGER_CLIENT_ROLE_CODES,
  PROJECT_ASSIGNABLE_ROLE_CODES,
  PERMISSION_TIMESHEETS_APPROVE,
  PROJECT_MANAGER_ROLE_CODES,
  type RoleCode,
} from "@/lib/users/roles";
import {
  PROJECT_STATUS_ACTIVE,
  type ApprovalWorkflowView,
  type ClientView,
  type CompanyView,
  type PersonView,
  type ProjectAssignmentView,
  type ProjectStatus,
  type ProjectView,
} from "./types";

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

export type ProjectStatusFilter = ProjectStatus | "all";

export type ProjectFilters = {
  page: number;
  pageSize: number;
  search: string;
  clientId: string;
  status: ProjectStatusFilter;
};

export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  page: 1,
  pageSize: 20,
  search: "",
  clientId: "",
  status: "ACTIVE",
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

  const result = await apiRequest<ClientView[]>(
    `/clients?${params.toString()}`,
    {
      token,
    },
  );

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

export async function fetchApproverClients(
  companyId: number,
): Promise<ClientView[]> {
  const result = await fetchClients({
    page: 1,
    pageSize: 100,
    search: "",
    companyId: String(companyId),
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
  if (filters.status !== "all") params.set("status", filters.status);

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
    status: PROJECT_STATUS_ACTIVE,
  });

  return result.ok ? result.projects : [];
}

export async function fetchProjectAssignments(
  projectId: number,
): Promise<ProjectAssignmentView[]> {
  const token = await getSessionToken();
  const result = await apiRequest<{ assignments: ProjectAssignmentView[] }>(
    `/projects/${projectId}/assignments`,
    { token },
  );

  return result.ok ? result.data.assignments : [];
}

export async function fetchProject(id: number): Promise<ProjectView | null> {
  const token = await getSessionToken();
  const result = await apiRequest<{ project: ProjectView }>(`/projects/${id}`, {
    token,
  });

  return result.ok ? result.data.project : null;
}

export async function fetchApprovalWorkflow(
  projectId: number,
): Promise<ApprovalWorkflowView | null> {
  const token = await getSessionToken();
  const result = await apiRequest<ApprovalWorkflowView>(
    `/projects/${projectId}/approval-steps`,
    { token },
  );

  return result.ok ? result.data : null;
}

async function fetchUsers(filter: {
  roleCode?: string;
  permission?: string;
}): Promise<UserView[]> {
  const token = await getSessionToken();
  const params = new URLSearchParams({
    page: "1",
    pageSize: "100",
    status: "active",
    sortBy: "fullName",
    sortDir: "asc",
  });
  if (filter.roleCode) params.set("roleCode", filter.roleCode);
  if (filter.permission) params.set("permission", filter.permission);

  const result = await apiRequest<UserView[]>(`/users?${params.toString()}`, {
    token,
  });

  return result.ok ? result.data : [];
}

function toPerson(user: UserView): PersonView {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roleCode: user.role.code,
    isActive: user.isActive,
  };
}

function byFullName(a: PersonView, b: PersonView): number {
  return a.fullName.localeCompare(b.fullName);
}

async function fetchPeopleByRoles(
  roleCodes: RoleCode[],
): Promise<PersonView[]> {
  const groups = await Promise.all(
    roleCodes.map((roleCode) => fetchUsers({ roleCode })),
  );

  return groups.flat().map(toPerson).sort(byFullName);
}

export async function fetchProjectManagers(): Promise<PersonView[]> {
  return fetchPeopleByRoles(PROJECT_MANAGER_ROLE_CODES);
}

export async function fetchApprovalCandidates(): Promise<PersonView[]> {
  const users = await fetchUsers({ permission: PERMISSION_TIMESHEETS_APPROVE });
  return users.map(toPerson).sort(byFullName);
}

export async function fetchManagerUsers(): Promise<PersonView[]> {
  return fetchPeopleByRoles(MANAGER_CLIENT_ROLE_CODES);
}

export async function fetchAssignableUsers(): Promise<PersonView[]> {
  return fetchPeopleByRoles(PROJECT_ASSIGNABLE_ROLE_CODES);
}
