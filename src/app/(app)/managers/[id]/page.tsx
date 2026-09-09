import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons";
import {
  CatalogNoAccess,
  CatalogNotFound,
} from "@/components/catalog/catalog-no-access";
import { ClientForm } from "@/components/catalog/client-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  fetchActiveCompanies,
  fetchClient,
  fetchManagerUsers,
} from "@/lib/catalog/queries";
import { canManageCatalog } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.catalog.clients.editTitle };
}

export default async function EditClientPage({
  params,
}: PageProps<"/managers/[id]">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManageCatalog(actor.role.code)) {
    return <CatalogNoAccess roleCode={actor.role.code} />;
  }

  const { id } = await params;
  const clientId = Number(id);
  const [client, companies, managers] = await Promise.all([
    Number.isInteger(clientId) && clientId > 0
      ? fetchClient(clientId)
      : Promise.resolve(null),
    fetchActiveCompanies(),
    fetchManagerUsers(),
  ]);

  if (!client) {
    return (
      <CatalogNotFound
        title={t.catalog.clients.notFoundTitle}
        body={t.catalog.clients.notFoundBody}
        backHref="/managers"
        backLabel={t.catalog.clients.back}
      />
    );
  }

  const linkedManager = managers.find(
    (person) => person.email === client.contactEmail,
  );

  const options =
    client.company && !companies.some((item) => item.id === client.company?.id)
      ? [client.company, ...companies]
      : companies;

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
          {client.clientName}
        </h1>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.catalog.form.section}
        </h2>
        <div className="p-5">
          <ClientForm
            mode="edit"
            clientId={client.id}
            companies={options}
            managers={managers}
            defaultValues={{
              companyId: client.company ? String(client.company.id) : "",
              userId: linkedManager ? String(linkedManager.id) : "",
              clientName: client.clientName,
              contactEmail: client.contactEmail ?? "",
              isActive: client.isActive,
            }}
          />
        </div>
      </section>
    </div>
  );
}
