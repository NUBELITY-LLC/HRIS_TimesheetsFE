import {
  BanIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@/components/icons";
import { getDictionary } from "@/i18n/server";
import {
  approvalChipState,
  approvalStepLabel,
  type ApprovalChipState,
} from "@/lib/timesheets/approvals";
import type { ApprovalStep } from "@/lib/timesheets/types";

const CHIP_CLASS: Record<ApprovalChipState, string> = {
  approved: "border-success-200 bg-success-50 text-success-700",
  current: "border-brand-600 bg-brand-50 text-brand-700",
  pending: "border-line bg-surface text-ink-muted",
  rejected: "border-danger-200 bg-danger-50 text-danger-700",
};

function StateIcon({ state }: { state: ApprovalChipState }) {
  if (state === "approved") return <CheckIcon className="size-3.5" />;
  if (state === "current") return <ClockIcon className="size-3.5" />;
  if (state === "rejected") return <BanIcon className="size-3.5" />;

  return <span className="size-2.5 rounded-full border border-current" />;
}

export async function ApprovalProgress({
  steps,
  currentSeq,
}: {
  steps: ApprovalStep[];
  currentSeq: number | null;
}) {
  const t = await getDictionary();

  if (steps.length === 0) {
    return <span className="text-xs text-ink-muted">{t.common.none}</span>;
  }

  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {steps.map((step, index) => {
        const state = approvalChipState(step, currentSeq);

        return (
          <li key={step.seq} className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${CHIP_CLASS[state]}`}
            >
              <StateIcon state={state} />
              {approvalStepLabel(step, t)}
            </span>
            {index < steps.length - 1 ? (
              <ChevronRightIcon className="size-3.5 text-ink-muted" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
