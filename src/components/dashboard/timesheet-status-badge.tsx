import { getDictionary } from "@/i18n/server";
import type { TimesheetStatus } from "@/lib/timesheets/types";

const STATUS_CLASS: Record<TimesheetStatus, string> = {
  DRAFT: "bg-surface-muted text-ink-muted",
  SUBMITTED: "bg-brand-50 text-brand-700",
  IN_REVIEW: "bg-brand-50 text-brand-700",
  REJECTED: "bg-danger-50 text-danger-700",
  APPROVED: "bg-success-50 text-success-700",
  CLOSED: "bg-success-50 text-success-700",
  PAID: "bg-success-50 text-success-800",
};

export async function TimesheetStatusBadge({
  status,
}: {
  status: TimesheetStatus;
}) {
  const t = await getDictionary();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {t.timesheetStatus[status]}
    </span>
  );
}
