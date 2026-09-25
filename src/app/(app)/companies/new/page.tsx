import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import { CatalogNoAccess } from "@/components/catalog/catalog-no-access";
import { CompanyForm } from "@/components/catalog/company-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { canManageCatalog } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.companies.createTitle };
}

export default async function NewCompanyPage() {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManageCatalog(actor)) {
    return <CatalogNoAccess />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link
          href="/companies"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {t.catalog.companies.back}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {t.catalog.companies.createTitle}
        </h1>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.catalog.form.section}
        </h2>
        <div className="p-5">
          <CompanyForm mode="create" />
        </div>
      </section>
    </div>
  );
}
