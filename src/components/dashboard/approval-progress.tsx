import {
  BanIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/server";
import {
  approvalChipState,
  approvalStepLabel,
  decidedByOther,
  decisionSummary,
  type ApprovalChipState,
  type DecidedStep,
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

const DECISION_TEXT: Record<ApprovalStep["status"], string> = {
  APPROVED: "text-success-700",
  REJECTED_TO_PREVIOUS: "text-warn-700",
  REJECTED_TO_CONSULTANT: "text-danger-700",
  PENDING: "text-ink-muted",
};

export async function ApprovalProgress({
  steps,
  currentSeq,
  detailed = false,
}: {
  steps: ApprovalStep[];
  currentSeq: number | null;
  detailed?: boolean;
}) {
  const t = await getDictionary();
  const locale = await getLocale();

  if (steps.length === 0) {
    return <span className="text-xs text-ink-muted">{t.common.none}</span>;
  }

  const chips = (
    <ol className="flex flex-wrap items-center gap-1.5">
      {steps.map((step, index) => {
        const state = approvalChipState(step, currentSeq);

        return (
          <li key={step.seq} className="flex items-center gap-1.5">
            <span
              title={decisionSummary(step, t, locale) ?? undefined}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${CHIP_CLASS[state]}`}
            >
              <StateIcon state={state} />
              {approvalStepLabel(step, t)}
              {step.decidedBy && decidedByOther(step, t) ? (
                <span className="font-normal opacity-80">
                  · {step.decidedBy.name}
                </span>
              ) : null}
            </span>
            {index < steps.length - 1 ? (
              <ChevronRightIcon className="size-3.5 text-ink-muted" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );

  if (!detailed) return chips;

  return (
    <div className="space-y-3">
      {chips}
      <DecisionList steps={steps} />
    </div>
  );
}

export async function DecisionList({
  steps,
}: {
  steps: (DecidedStep & { comments: string | null })[];
}) {
  const t = await getDictionary();
  const locale = await getLocale();

  const decisions = steps
    .filter((step) => step.decidedAt && step.status !== "PENDING")
    .sort((left, right) =>
      (left.decidedAt ?? "").localeCompare(right.decidedAt ?? ""),
    );

  if (decisions.length === 0) return null;

  return (
    <ul className="space-y-1.5 text-xs">
      {decisions.map((step) => (
        <li key={step.seq} className={DECISION_TEXT[step.status]}>
          {decisionSummary(step, t, locale)}
          {step.comments ? (
            <span className="text-ink-soft"> — “{step.comments}”</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
