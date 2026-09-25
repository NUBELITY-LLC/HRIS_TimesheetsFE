import { DownloadIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/server";
import type { ApprovalAttachment } from "@/lib/approvals/types";
import { formatDateTime } from "@/lib/format/datetime";

function formatSize(bytes: number): string {
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export async function EvidenceLink({
  approvalId,
  attachment,
}: {
  approvalId: number;
  attachment: ApprovalAttachment;
}) {
  const t = await getDictionary();
  const locale = await getLocale();

  return (
    <a
      href={`/evidence/${approvalId}/${attachment.id}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-start gap-2 rounded-lg border border-line p-2.5 transition-colors hover:bg-surface-muted"
    >
      <DownloadIcon className="mt-0.5 size-4 shrink-0 text-ink-muted" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-brand-600">
          {attachment.fileName}
        </span>
        <span className="block text-xs text-ink-muted">
          {formatSize(attachment.sizeBytes)} ·{" "}
          {attachment.uploadedBy.name ?? t.common.unknown} ·{" "}
          {formatDateTime(attachment.uploadedAt, locale, {
            empty: t.common.none,
            invalid: t.common.unknown,
          })}
        </span>
      </span>
    </a>
  );
}
