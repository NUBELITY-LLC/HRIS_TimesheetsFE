import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import {
  CatalogNoAccess,
  CatalogNotFound,
} from "@/components/catalog/catalog-no-access";
import { ProjectForm } from "@/components/catalog/project-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  fetchActiveClients,
  fetchProject,
  fetchProjectManagers,
} from "@/lib/catalog/queries";
import { canManageCatalog } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.projects.editTitle };
}

export default async function EditProjectPage({
  params,
}: PageProps<"/projects/[id]">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManageCatalog(actor.role.code)) {
    return <CatalogNoAccess roleCode={actor.role.code} />;
  }

  const { id } = await params;
  const projectId = Number(id);
  const [project, clients, managers] = await Promise.all([
    Number.isInteger(projectId) && projectId > 0
      ? fetchProject(projectId)
      : Promise.resolve(null),
    fetchActiveClients(),
    fetchProjectManagers(),
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

  const clientOptions =
    project.client && !clients.some((item) => item.id === project.client?.id)
      ? [
          {
            id: project.client.id,
            clientName: project.client.name,
            contactEmail: null,
            isActive: project.client.isActive,
            company: null,
          },
          ...clients,
        ]
      : clients;

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
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.catalog.form.section}
        </h2>
        <div className="p-5">
          <ProjectForm
            mode="edit"
            projectId={project.id}
            clients={clientOptions}
            managers={managers}
            defaultValues={{
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
    </div>
  );
}
