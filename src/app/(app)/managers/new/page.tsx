import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import { CatalogNoAccess } from "@/components/catalog/catalog-no-access";
import { ClientForm } from "@/components/catalog/client-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  fetchActiveCompanies,
  fetchManagerUsers,
} from "@/lib/catalog/queries";
import { canManageCatalog } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.clients.createTitle };
}

export default async function NewClientPage() {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManageCatalog(actor)) {
    return <CatalogNoAccess />;
  }

  const [companies, managers] = await Promise.all([
    fetchActiveCompanies(),
    fetchManagerUsers(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link
          href="/managers"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {t.catalog.clients.back}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {t.catalog.clients.createTitle}
        </h1>
      </header>

      {companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-sm font-medium text-ink">
            {t.catalog.companies.noCompaniesTitle}
          </p>
          <Link
            href="/companies/new"
            className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t.catalog.companies.newCompany}
          </Link>
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
            {t.catalog.form.section}
          </h2>
          <div className="p-5">
            <ClientForm
              mode="create"
              companies={companies}
              managers={managers}
            />
          </div>
        </section>
      )}
    </div>
  );
}
