import { getDictionary } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ApprovalStepView } from "@/lib/catalog/types";
import { roleName } from "@/lib/users/roles";

function approverLabel(step: ApprovalStepView, t: Dictionary): string {
  if (step.approverType === "USER") {
    return step.approver?.fullName ?? step.approverName ?? t.common.unknown;
  }

  if (step.approverType === "ROLE") {
    return step.roleName ?? roleName(step.roleCode ?? "", t);
  }

  return (
    step.client?.name ??
    step.approverName ??
    step.approverEmail ??
    t.approvals.client
  );
}

export async function ApprovalStepsSummary({
  steps,
}: {
  steps: ApprovalStepView[];
}) {
  const t = await getDictionary();

  if (steps.length === 0) {
    return (
      <p className="text-sm text-ink-muted">{t.catalog.approvals.noApprovers}</p>
    );
  }

  return (
    <ol className="space-y-2">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line p-3 text-sm"
        >
          <span className="font-semibold text-ink">
            {t.catalog.approvals.stepLabel(index + 1)}
          </span>
          <span className="text-ink-soft">{approverLabel(step, t)}</span>
          <span className="text-xs text-ink-muted">
            {t.catalog.approvals.types[step.approverType]}
          </span>
        </li>
      ))}
    </ol>
  );
}
