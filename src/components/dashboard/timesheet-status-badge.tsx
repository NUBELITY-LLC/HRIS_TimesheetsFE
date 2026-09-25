import { getDictionary } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  financeStatusOf,
  type FinanceStatus,
  type TimesheetStatus,
} from "@/lib/timesheets/types";
import { ROLE_FINANCE } from "@/lib/users/roles";

const STATUS_CLASS: Record<TimesheetStatus, string> = {
  DRAFT: "bg-surface-muted text-ink-muted",
  SUBMITTED: "bg-brand-50 text-brand-700",
  IN_REVIEW: "bg-brand-50 text-brand-700",
  REJECTED: "bg-danger-50 text-danger-700",
  APPROVED: "bg-success-50 text-success-700",
  CLOSED: "bg-success-50 text-success-700",
  PAID: "bg-success-50 text-success-800",
};

const FINANCE_CLASS: Record<FinanceStatus, string> = {
  REVIEW: "bg-brand-50 text-brand-700",
  PAYROLL: "bg-warn-50 text-warn-700",
  PAID: "bg-success-50 text-success-800",
};

export async function TimesheetStatusBadge({
  status,
}: {
  status: TimesheetStatus;
}) {
  const [t, user] = await Promise.all([getDictionary(), getCurrentUser()]);

  const finance =
    user?.role.code === ROLE_FINANCE ? financeStatusOf(status) : null;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        finance ? FINANCE_CLASS[finance] : STATUS_CLASS[status]
      }`}
    >
      {finance ? t.financeStatus[finance] : t.timesheetStatus[status]}
    </span>
  );
}
