import type { PendingApproval } from "./types";
import { hourlyRatesOf } from "@/lib/payroll/rate-spans";

export type ConsultantGroup = {
  consultantId: number;
  consultantName: string;
  currency: string | null;
  totalMinutes: number;
  totalAmount: number | null;
  hourlyRates: number[];
  approvals: PendingApproval[];
};

function money(value: number | null | undefined): number | null {
  const parsed = Number(value);
  return value === null || value === undefined || !Number.isFinite(parsed)
    ? null
    : parsed;
}

export function groupByConsultant(
  approvals: PendingApproval[],
): ConsultantGroup[] {
  const groups = new Map<number, ConsultantGroup>();

  for (const approval of approvals) {
    let group = groups.get(approval.consultant.id);

    if (!group) {
      group = {
        consultantId: approval.consultant.id,
        consultantName: approval.consultant.name,
        currency: approval.currency ?? null,
        totalMinutes: 0,
        totalAmount: null,
        hourlyRates: [],
        approvals: [],
      };
      groups.set(approval.consultant.id, group);
    }

    const amount = money(approval.amount);

    group.totalMinutes += approval.totalMinutes;
    if (amount !== null) {
      group.totalAmount = Number(
        ((group.totalAmount ?? 0) + amount).toFixed(2),
      );
    }
    group.hourlyRates.push(...hourlyRatesOf(approval.pay, approval.hourlyRate));
    group.approvals.push(approval);
  }

  return [...groups.values()];
}
