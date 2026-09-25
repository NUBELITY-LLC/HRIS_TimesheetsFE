import { AlertIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";

export async function PayrollNoAccess() {
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
            {t.payTermsPage.noAccessBody}
          </p>
        </div>
      </div>
    </div>
  );
}
