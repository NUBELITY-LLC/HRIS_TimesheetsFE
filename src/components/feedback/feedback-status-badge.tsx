import type { Dictionary } from "@/i18n/dictionaries";
import type { FeedbackStatus } from "@/lib/feedback/types";

const STATUS_CLASS: Record<FeedbackStatus, string> = {
  NEW: "bg-brand-50 text-brand-700",
  IN_REVIEW: "bg-warn-50 text-warn-700",
  RESOLVED: "bg-success-50 text-success-700",
  ARCHIVED: "bg-surface-muted text-ink-muted",
};

export function FeedbackStatusBadge({ status, t }: { status: FeedbackStatus; t: Dictionary }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {t.feedback.statuses[status]}
    </span>
  );
}
