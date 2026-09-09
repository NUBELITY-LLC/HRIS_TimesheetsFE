import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import {
  CatalogNoAccess,
  CatalogNotFound,
} from "@/components/catalog/catalog-no-access";
import { ProjectTeam } from "@/components/catalog/project-team";
import { getDictionary, getLocale } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  fetchAssignableUsers,
  fetchProject,
  fetchProjectAssignments,
} from "@/lib/catalog/queries";
import { formatProjectDate, isProjectClosed } from "@/lib/catalog/lifecycle";
import { canManageCatalog } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.team.title };
}

export default async function ProjectTeamPage({
  params,
}: PageProps<"/projects/[id]/team">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();

  if (!canManageCatalog(actor.role.code)) {
    return <CatalogNoAccess roleCode={actor.role.code} />;
  }

  const { id } = await params;
  const projectId = Number(id);
  const isValidId = Number.isInteger(projectId) && projectId > 0;
  const [project, assignments, people] = await Promise.all([
    isValidId ? fetchProject(projectId) : Promise.resolve(null),
    isValidId ? fetchProjectAssignments(projectId) : Promise.resolve([]),
    fetchAssignableUsers(),
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

  const closed = isProjectClosed(project);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          href={`/projects/${project.id}`}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {t.catalog.team.back}
        </Link>
        <p className="mt-2 text-sm text-ink-muted">{t.catalog.team.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {project.projectName}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {project.client?.name ?? t.common.none} ·{" "}
          {project.manager?.fullName ?? t.catalog.projects.noManager} ·{" "}
          {formatProjectDate(project.startDate, locale, t.common.none)} –{" "}
          {formatProjectDate(project.endDate, locale, t.catalog.projects.openDates)}
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-3.5">
          <h2 className="text-sm font-semibold text-ink">
            {t.catalog.team.title}
          </h2>
          <p className="text-xs text-ink-muted">
            {t.catalog.team.count(
              assignments.filter((item) => item.isActive).length,
            )}
          </p>
        </div>
        <div className="p-5">
          <ProjectTeam
            projectId={project.id}
            assignments={assignments}
            people={people}
            locked={closed}
          />
        </div>
      </section>
    </div>
  );
}
