import { AlertIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";
import { roleName } from "@/lib/users/roles";

export async function CatalogNoAccess({ roleCode }: { roleCode: string }) {
  const t = await getDictionary();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
        <div>
          <h1 className="text-sm font-semibold text-ink">
            {t.catalog.noAccessTitle}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {t.catalog.noAccessBody(roleName(roleCode, t))}
          </p>
        </div>
      </div>
    </div>
  );
}

export async function CatalogNotFound({
  title,
  body,
  backHref,
  backLabel,
}: {
  title: string;
  body: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
        <div>
          <h1 className="text-sm font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{body}</p>
          <a
            href={backHref}
            className="mt-3 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {backLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
