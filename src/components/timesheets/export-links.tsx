"use client";

import { DownloadIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";

const LINK_CLASS =
  "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted";

export function ExportLinks({
  basePath,
  hint,
}: {
  basePath: string;
  hint?: string | null;
}) {
  const t = useDictionary();

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-muted">{t.timesheets.export.label}</span>
        <a href={`${basePath}/xlsx`} download className={LINK_CLASS}>
          <DownloadIcon className="size-3.5" />
          {t.timesheets.export.xlsx}
        </a>
        <a href={`${basePath}/pdf`} download className={LINK_CLASS}>
          <DownloadIcon className="size-3.5" />
          {t.timesheets.export.pdf}
        </a>
      </div>
      {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
