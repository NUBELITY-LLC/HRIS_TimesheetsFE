import { AlertIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";

export function NoInboxAccess({ t, body }: { t: Dictionary; body: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
        <div>
          <h1 className="text-sm font-semibold text-ink">{t.feedback.noAccessTitle}</h1>
          <p className="mt-1 text-sm text-ink-muted">{body}</p>
        </div>
      </div>
    </div>
  );
}
