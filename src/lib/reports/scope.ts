import type { ReportScope } from "./queries";
import type { CompanyFilters, ReportScopes } from "./types";

type Params = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function knownId(value: string, ids: number[]): string {
  const id = Number(value);
  return Number.isInteger(id) && ids.includes(id) ? String(id) : "";
}

export const COMPANY_FILTER_KEYS = ["projectId", "userId"] as const;

export const EMPTY_COMPANY_FILTERS: CompanyFilters = {
  projectId: null,
  userId: null,
};

export function parseCompanyFilters(params: Params): CompanyFilters {
  const filters = { ...EMPTY_COMPANY_FILTERS };

  for (const key of COMPANY_FILTER_KEYS) {
    if (params[key] === undefined) continue;
    const id = Number(firstParam(params[key]));
    filters[key] = Number.isInteger(id) && id > 0 ? String(id) : "";
  }

  return filters;
}

export function setCompanyFilterParams(
  params: URLSearchParams,
  filters: CompanyFilters,
): URLSearchParams {
  for (const key of COMPANY_FILTER_KEYS) {
    const value = filters[key];
    if (value !== null) params.set(key, value);
  }

  return params;
}

export function parseScope(params: Params, scopes: ReportScopes): ReportScope {
  const projectId = knownId(
    firstParam(params.projectId),
    scopes.projects.map((project) => project.id),
  );
  const project = scopes.projects.find(
    (candidate) => String(candidate.id) === projectId,
  );
  const companyId =
    knownId(
      firstParam(params.companyId),
      scopes.companies.map((company) => company.id),
    ) || (project ? String(project.companyId) : "");

  return {
    companyId,
    projectId:
      project && String(project.companyId) === companyId ? projectId : "",
  };
}
