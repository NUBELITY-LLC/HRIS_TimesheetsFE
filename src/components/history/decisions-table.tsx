import Link from "next/link";

import { CheckIcon, ChevronRightIcon, RefreshIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/server";
import type { ApprovalDecisionHistory } from "@/lib/approvals/types";
import { formatDateTime } from "@/lib/format/datetime";
import { getCurrentUser } from "@/lib/auth/session";
import { formatMoney } from "@/lib/format/money";
import { canSeeCosts } from "@/lib/users/roles";
import { formatMinutes } from "@/lib/timesheets/rules";
import { formatWeekRange } from "@/lib/timesheets/week";

const DECISION_STYLE: Record<string, string> = {
  APPROVED: "bg-success-50 text-success-700",
  RETURNED_TO_PREVIOUS: "bg-warn-50 text-warn-700",
  RETURNED_TO_CONSULTANT: "bg-danger-50 text-danger-700",
};

export async function DecisionsTable({
  decisions,
  empty,
}: {
  decisions: ApprovalDecisionHistory[];
  empty: { title: string; body: string };
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const user = await getCurrentUser();
  const showCosts = user ? canSeeCosts(user) : false;

  if (decisions.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-5 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-ink">{empty.title}</p>
        <p className="mt-1 text-sm text-ink-muted">{empty.body}</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
        {t.history.decisions.listTitle}
      </h2>

      <ul className="divide-y divide-line">
        {decisions.map((decision) => {
          const row = (
            <>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">
                  {decision.consultant.name}
                </span>
                <span className="block text-xs text-ink-muted">
                  {decision.company?.name ?? t.common.none} ·{" "}
                  {decision.client.name} / {decision.project.name}
                  {decision.assignmentCode
                    ? ` · ${decision.assignmentCode}`
                    : ""}{" "}
                  · {formatWeekRange(decision.weekStart, locale)} ·{" "}
                  {decision.submissionCode ?? t.common.none}
                </span>
                {decision.comments ? (
                  <span className="mt-1 block text-xs text-ink-soft italic">
                    “{decision.comments}”
                  </span>
                ) : null}
              </span>

              <span className="w-20 text-right font-semibold text-brand-600 tabular-nums">
                {formatMinutes(decision.totalMinutes)}
              </span>

              {showCosts ? (
                <span className="w-24 text-right text-sm text-ink-muted tabular-nums">
                  {formatMoney(decision.amount, decision.currency, locale)}
                </span>
              ) : null}

              <span className="w-44">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    DECISION_STYLE[decision.decision]
                  }`}
                >
                  {decision.decision === "APPROVED" ? (
                    <CheckIcon className="size-3" />
                  ) : (
                    <RefreshIcon className="size-3" />
                  )}
                  {t.history.decisions.kinds[decision.decision]}
                </span>
                <span className="mt-1 block text-[11px] text-ink-muted">
                  {formatDateTime(decision.decidedAt, locale, {
                    empty: t.common.none,
                    invalid: t.common.unknown,
                  })}
                </span>
              </span>
            </>
          );

          return (
            <li key={decision.eventId}>
              {decision.approvalId ? (
                <Link
                  href={`/reviews/${decision.approvalId}`}
                  className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3.5 transition-colors hover:bg-surface-muted/50"
                >
                  {row}
                  <ChevronRightIcon className="size-4 shrink-0 text-ink-muted" />
                </Link>
              ) : (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3.5">
                  {row}
                  <span className="size-4 shrink-0" />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
