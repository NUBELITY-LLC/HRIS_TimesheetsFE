"use client";

import { useState } from "react";

import { useDictionary } from "@/i18n/provider";
import type { ReportScope } from "@/lib/reports/queries";
import type { ReportScopes } from "@/lib/reports/types";

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";

export function ReportScopeSelects({
  scopes,
  scope,
}: {
  scopes: ReportScopes;
  scope: ReportScope;
}) {
  const t = useDictionary();
  const s = t.reports.scope;
  const [companyId, setCompanyId] = useState(scope.companyId);
  const [projectId, setProjectId] = useState(scope.projectId);

  const projects = companyId
    ? scopes.projects.filter(
        (project) => String(project.companyId) === companyId,
      )
    : scopes.projects;

  function changeCompany(next: string) {
    setCompanyId(next);
    const stillVisible = scopes.projects.some(
      (project) =>
        String(project.id) === projectId &&
        (!next || String(project.companyId) === next),
    );
    if (!stillVisible) setProjectId("");
  }

  return (
    <>
      <div className="w-full space-y-1.5 sm:w-56">
        <label
          htmlFor="companyId"
          className="block text-xs font-medium text-ink-soft"
        >
          {s.company}
        </label>
        <select
          id="companyId"
          name="companyId"
          value={companyId}
          onChange={(event) => changeCompany(event.target.value)}
          className={FIELD_CLASS}
        >
          <option value="">{s.allCompanies}</option>
          {scopes.companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full space-y-1.5 sm:w-64">
        <label
          htmlFor="projectId"
          className="block text-xs font-medium text-ink-soft"
        >
          {s.project}
        </label>
        <select
          id="projectId"
          name="projectId"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          className={FIELD_CLASS}
        >
          <option value="">{s.allProjects}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.clientName
                ? `${project.name} · ${project.clientName}`
                : project.name}
              {project.isClosed ? ` (${s.closed})` : ""}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
