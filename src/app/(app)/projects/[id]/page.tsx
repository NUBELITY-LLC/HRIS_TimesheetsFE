import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CheckIcon,
  LockIcon,
} from "@/components/icons";
import { ApprovalStepsForm } from "@/components/catalog/approval-steps-form";
import { ApprovalStepsSummary } from "@/components/catalog/approval-steps-summary";
import { ProjectLifecycle } from "@/components/catalog/project-lifecycle";
import {
  CatalogNoAccess,
  CatalogNotFound,
} from "@/components/catalog/catalog-no-access";
import { ProjectForm } from "@/components/catalog/project-form";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  fetchActiveClients,
  fetchActiveCompanies,
  fetchApprovalCandidates,
  fetchApprovalWorkflow,
  fetchApproverClients,
  fetchClient,
  fetchProject,
  fetchProjectAssignments,
  fetchProjectManagers,
} from "@/lib/catalog/queries";
import {
  formatProjectDate,
  isProjectClosed,
  projectLifecycleLabel,
} from "@/lib/catalog/lifecycle";
import { APPROVERS_MAX, APPROVERS_MIN } from "@/lib/catalog/types";
import { toISODate } from "@/lib/timesheets/week";
import { canManageCatalog } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.projects.editTitle };
}

export default async function EditProjectPage({
  params,
  searchParams,
}: PageProps<"/projects/[id]">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();

  if (!canManageCatalog(actor)) {
    return <CatalogNoAccess />;
  }

  const { id } = await params;
  const { created } = await searchParams;
  const projectId = Number(id);
  const isValidId = Number.isInteger(projectId) && projectId > 0;
  const [
    project,
    clients,
    companies,
    managers,
    approvers,
    workflow,
    assignments,
  ] = await Promise.all([
    isValidId ? fetchProject(projectId) : Promise.resolve(null),
    fetchActiveClients(),
    fetchActiveCompanies(),
    fetchProjectManagers(),
    fetchApprovalCandidates(),
    isValidId ? fetchApprovalWorkflow(projectId) : Promise.resolve(null),
    isValidId ? fetchProjectAssignments(projectId) : Promise.resolve([]),
  ]);

  if (!project) {
    return (
      <CatalogNotFound
        title={t.catalog.projects.notFoundTitle}
        body={t.catalog.projects.notFoundBody}
        backHref="/projects"
        backLabel={t.catalog.projects.back}
      />
    );
  }

  const projectClient = project.client;
  const listedClient = projectClient
    ? (clients.find((item) => item.id === projectClient.id) ?? null)
    : null;
  const clientOptions =
    projectClient && !listedClient
      ? [
          {
            id: projectClient.id,
            clientName: projectClient.name,
            contactEmail: null,
            isActive: projectClient.isActive,
            company: null,
            user: null,
          },
          ...clients,
        ]
      : clients;

  const closed = isProjectClosed(project);
  const workflowReady = workflow?.isComplete ?? false;
  const activeAssignments = assignments.filter(
    (assignment) => assignment.isActive,
  ).length;

  const projectClientRecord = projectClient
    ? (listedClient ?? (await fetchClient(projectClient.id)))
    : null;
  const approverClients = projectClientRecord?.company
    ? await fetchApproverClients(projectClientRecord.company.id)
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          href="/projects"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {t.catalog.projects.back}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {project.projectName}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {projectLifecycleLabel(project, locale, t)}
        </p>
      </header>

      {created ? (
        <p
          role="status"
          className="flex gap-3 rounded-lg border border-success-200 bg-success-50 p-3.5 text-sm text-success-800"
        >
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          {t.catalog.projects.createdBanner(project.projectName)}
        </p>
      ) : null}

      {workflowReady ? (
        <Link
          href={`/projects/${project.id}/team`}
          className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm transition-colors hover:bg-surface-muted"
        >
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="size-5 shrink-0 text-ink-muted" />
            <div>
              <p className="text-sm font-semibold text-ink">
                {t.catalog.team.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {t.catalog.team.count(activeAssignments)}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-brand-600">
            {t.catalog.team.manage}
          </span>
        </Link>
      ) : (
        <div
          aria-disabled="true"
          className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-muted/50 p-5"
        >
          <div className="flex items-center gap-3">
            <LockIcon className="size-5 shrink-0 text-ink-muted" />
            <div>
              <p className="text-sm font-semibold text-ink-muted">
                {t.catalog.team.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {t.catalog.team.blocked(workflow?.minApprovers ?? APPROVERS_MIN)}
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.catalog.form.section}
        </h2>
        <div className="p-5">
          <ProjectForm
            mode="edit"
            projectId={project.id}
            companies={companies}
            clients={clientOptions}
            managers={managers}
            lockEndDate={closed}
            defaultValues={{
              companyId: projectClientRecord?.company
                ? String(projectClientRecord.company.id)
                : "",
              clientId: project.client ? String(project.client.id) : "",
              projectName: project.projectName,
              code: project.code ?? "",
              managerId: project.manager ? String(project.manager.id) : "",
              startDate: project.startDate ?? "",
              endDate: project.endDate ?? "",
            }}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.catalog.approvals.section}
        </h2>
        <div className="p-5">
          {closed ? (
            <ApprovalStepsSummary steps={workflow?.approvalSteps ?? []} />
          ) : (
            <ApprovalStepsForm
              projectId={project.id}
              steps={workflow?.approvalSteps ?? []}
              minApprovers={workflow?.minApprovers ?? APPROVERS_MIN}
              maxApprovers={workflow?.maxApprovers ?? APPROVERS_MAX}
              approvers={approvers}
              clients={approverClients}
              projectClientId={projectClientRecord?.id ?? null}
            />
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.catalog.lifecycle.section}
        </h2>
        <div className="p-5">
          <ProjectLifecycle
            projectId={project.id}
            isClosed={closed}
            endDate={formatProjectDate(project.endDate, locale, t.common.none)}
            activeAssignments={activeAssignments}
            today={toISODate(new Date())}
          />
        </div>
      </section>
    </div>
  );
}
