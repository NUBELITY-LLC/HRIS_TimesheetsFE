import Link from "next/link";

import { AlertIcon, ArrowLeftIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";

export async function NoAccess({ message }: { message: string }) {
  const t = await getDictionary();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
        <div>
          <h1 className="text-sm font-semibold text-ink">
            {t.users.noAccessUserTitle}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{message}</p>
          <Link
            href="/users"
            className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ArrowLeftIcon className="size-4" />
            {t.common.backToUsers}
          </Link>
        </div>
      </div>
    </div>
  );
}
