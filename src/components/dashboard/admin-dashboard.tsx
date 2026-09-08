import Link from "next/link";

import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { SummaryCards, type SummaryCard } from "@/components/dashboard/summary-cards";
import { getDictionary } from "@/i18n/server";
import { formatMinutes } from "@/lib/timesheets/rules";
import {
  fetchTeamSubmissions,
  fetchTeamSummary,
} from "@/lib/timesheets/queries";

export async function AdminDashboard() {
  const t = await getDictionary();

  const [summary, submissions] = await Promise.all([
    fetchTeamSummary(),
    fetchTeamSubmissions(),
  ]);

  const cards: SummaryCard[] = [
    {
      key: "hours",
      label: t.dashboard.teamHours,
      value: formatMinutes(summary.monthMinutes),
      hint: t.dashboard.teamHoursHint,
      icon: "hours",
      tone: "brand",
    },
    {
      key: "pending",
      label: t.dashboard.pendingReviewTitle,
      value: t.dashboard.pendingValue(summary.pendingReviewCount),
      hint: t.dashboard.pendingReviewHint,
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
        title={t.dashboard.teamTitle}
        submissions={submissions}
        action="review"
        showOwner
        empty={{
          title: t.dashboard.teamEmptyTitle,
          body: t.dashboard.teamEmptyBody,
        }}
        headerAction={
          <Link
            href="/reviews"
            className="inline-flex rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
          >
            {t.reviews.listTitle}
          </Link>
        }
      />
    </>
  );
}
