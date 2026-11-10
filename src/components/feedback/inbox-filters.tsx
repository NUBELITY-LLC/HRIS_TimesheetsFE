import Link from "next/link";

import type { Dictionary } from "@/i18n/dictionaries";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  type FeedbackFilters,
} from "@/lib/feedback/types";

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";
const LABEL_CLASS = "block text-xs font-medium text-ink-soft";

export function InboxFilters({
  t,
  filters,
  action,
  showStatus,
}: {
  t: Dictionary;
  filters: FeedbackFilters;
  action: string;
  showStatus: boolean;
}) {
  const f = t.feedback.inbox.filters;

  return (
    <form
      action={action}
      aria-label={f.label}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
    >
      <div className="space-y-1.5">
        <label htmlFor="feedback-from" className={LABEL_CLASS}>
          {f.from}
        </label>
        <input id="feedback-from" type="date" name="from" defaultValue={filters.from} className={FIELD_CLASS} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="feedback-to" className={LABEL_CLASS}>
          {f.to}
        </label>
        <input id="feedback-to" type="date" name="to" defaultValue={filters.to} className={FIELD_CLASS} />
      </div>
      {showStatus ? (
        <div className="min-w-44 space-y-1.5">
          <label htmlFor="feedback-status" className={LABEL_CLASS}>
            {f.status}
          </label>
          <select id="feedback-status" name="status" defaultValue={filters.status} className={FIELD_CLASS}>
            <option value="">{f.allStatuses}</option>
            {FEEDBACK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t.feedback.statuses[status]}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="min-w-56 space-y-1.5">
        <label htmlFor="feedback-category" className={LABEL_CLASS}>
          {f.category}
        </label>
        <select id="feedback-category" name="category" defaultValue={filters.category} className={FIELD_CLASS}>
          <option value="">{f.allCategories}</option>
          {FEEDBACK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {t.feedback.categories[category]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {f.apply}
        </button>
        <Link
          href={action}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
        >
          {f.clear}
        </Link>
      </div>
    </form>
  );
}
