import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import { CatalogNoAccess } from "@/components/catalog/catalog-no-access";
import { ProjectForm } from "@/components/catalog/project-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  fetchActiveClients,
  fetchActiveCompanies,
  fetchProjectManagers,
} from "@/lib/catalog/queries";
import { canManageCatalog } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.projects.createTitle };
}

export default async function NewProjectPage() {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManageCatalog(actor)) {
    return <CatalogNoAccess />;
  }

  const [clients, companies, managers] = await Promise.all([
    fetchActiveClients(),
    fetchActiveCompanies(),
    fetchProjectManagers(),
  ]);

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
          {t.catalog.projects.createTitle}
        </h1>
      </header>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-sm font-medium text-ink">
            {t.catalog.projects.noClientsTitle}
          </p>
          <Link
            href="/managers/new"
            className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t.catalog.clients.newClient}
          </Link>
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
            {t.catalog.form.section}
          </h2>
          <div className="p-5">
            <ProjectForm
              mode="create"
              companies={companies}
              clients={clients}
              managers={managers}
            />
          </div>
        </section>
      )}
    </div>
  );
}
