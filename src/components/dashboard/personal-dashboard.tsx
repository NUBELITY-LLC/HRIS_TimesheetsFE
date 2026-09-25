import Link from "next/link";

import { ChevronRightIcon } from "@/components/icons";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import {
  SummaryCards,
  type SummaryCard,
} from "@/components/dashboard/summary-cards";
import { getDictionary } from "@/i18n/server";
import { formatMinutes } from "@/lib/timesheets/rules";
import {
  fetchDashboardSummary,
  fetchRecentSubmissions,
} from "@/lib/timesheets/queries";

export async function PersonalDashboard() {
  const t = await getDictionary();

  const [summary, submissions] = await Promise.all([
    fetchDashboardSummary(),
    fetchRecentSubmissions(),
  ]);

  const cards: SummaryCard[] = [
    {
      key: "hours",
      label: t.dashboard.monthHours,
      value: formatMinutes(summary.monthMinutes),
      hint:
        summary.monthTargetMinutes === null
          ? t.dashboard.monthNoTarget
          : t.dashboard.monthTarget(formatMinutes(summary.monthTargetMinutes)),
      icon: "hours",
      tone: "brand",
    },
    {
      key: "pending",
      label: t.dashboard.pendingTitle,
      value: t.dashboard.pendingValue(summary.pendingCount),
      hint: t.dashboard.pendingHint,
      icon: "pending",
      tone: "warn",
    },
    {
      key: "approved",
      label: t.dashboard.approvedTitle,
      value: t.dashboard.approvedValue(summary.approvedCount),
      hint: t.dashboard.approvedHint,
      icon: "approved",
      tone: "success",
    },
  ];

  return (
    <>
      <SummaryCards cards={cards} />
      <SubmissionsTable
        title={t.dashboard.recentTitle}
        submissions={submissions}
        action="view"
        empty={{
          title: t.dashboard.emptyTitle,
          body: t.dashboard.emptyBody,
          cta: { href: "/timesheets", label: t.dashboard.emptyCta },
        }}
        headerAction={
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
          >
            {t.dashboard.viewAll}
            <ChevronRightIcon className="size-3.5" />
          </Link>
        }
      />
    </>
  );
}
