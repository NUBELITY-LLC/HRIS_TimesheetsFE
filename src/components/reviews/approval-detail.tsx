import Link from "next/link";

import {
  ArrowLeftIcon,
  BanIcon,
  CheckIcon,
  ClockIcon,
  MailIcon,
  PaperclipIcon,
  RefreshIcon,
} from "@/components/icons";
import { DecisionList } from "@/components/dashboard/approval-progress";
import { TimesheetStatusBadge } from "@/components/dashboard/timesheet-status-badge";
import { ApproveOnBehalfForm } from "@/components/reviews/approve-on-behalf-form";
import { DecideApprovalForm } from "@/components/reviews/decide-approval-form";
import { EvidenceLink } from "@/components/reviews/evidence-link";
import { PayBreakdown } from "@/components/payroll/pay-breakdown";
import { getDictionary, getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import type { ApprovalDetail } from "@/lib/approvals/types";
import { formatMoney } from "@/lib/format/money";
import {
  approvalChipState,
  approvalStepLabel,
  decidedByOther,
  decisionSummary,
  latestDecision,
} from "@/lib/timesheets/approvals";
import { formatMinutes } from "@/lib/timesheets/rules";
import {
  formatDayAndMonth,
  formatWeekRange,
  formatWeekday,
  fromISODate,
} from "@/lib/timesheets/week";
import { ExportLinks } from "@/components/timesheets/export-links";
import { formatHourlyRates, hourlyRatesOf } from "@/lib/payroll/rate-spans";

const CHIP_STYLES: Record<string, string> = {
  approved: "border-success-200 bg-success-50 text-success-800",
  current: "border-brand-300 bg-brand-50 text-brand-700",
  pending: "border-line bg-surface text-ink-muted",
  rejected: "border-danger-200 bg-danger-50 text-danger-700",
};

const DECISION_STYLES: Record<string, string> = {
  APPROVED: "border-success-200 bg-success-50 text-success-800",
  REJECTED_TO_PREVIOUS: "border-warn-200 bg-warn-50 text-warn-700",
  REJECTED_TO_CONSULTANT: "border-danger-200 bg-danger-50 text-danger-700",
};

export async function ApprovalDetailView({
  approval,
  continued = false,
}: {
  approval: ApprovalDetail;
  continued?: boolean;
}) {
  const t = await getDictionary();
  const locale = await getLocale();

  const currentStep = approval.steps.find(
    (step) => step.seq === approval.currentSeq,
  );
  const nextStep = approval.steps.find((step) => step.seq > approval.seq);
  const lastResolved = latestDecision(approval.steps);
  const lastSummary = lastResolved
    ? decisionSummary(lastResolved, t, locale)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <Link
          href="/reviews"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {t.reviews.back}
        </Link>
        <p className="mt-3 text-sm text-ink-muted">
          {t.reviews.detail.eyebrow}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {approval.consultant.name}
          </h1>
          <TimesheetStatusBadge status={approval.timesheetStatus} />
          <span className="text-sm text-ink-muted">
            {approval.submissionCode ?? t.common.none}
          </span>
        </div>
        <div className="mt-3">
          <ExportLinks basePath={`/reviews/${approval.approvalId}/export`} />
        </div>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t.reviews.phaseTitle}
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-600">
          {currentStep
            ? t.reviews.detail.activeStage(
                currentStep.seq,
                approvalStepLabel(currentStep, t),
              )
            : t.reviews.noActiveStage}
        </p>
        <ol className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2">
          {approval.steps.map((step, index) => {
            const chip = approvalChipState(step, approval.currentSeq);

            return (
              <li key={step.seq} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-ink-muted">
                    ›
                  </span>
                ) : null}
                <span
                  title={decisionSummary(step, t, locale) ?? undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${CHIP_STYLES[chip]}`}
                >
                  {chip === "approved" ? (
                    <CheckIcon className="size-3" />
                  ) : chip === "current" ? (
                    <ClockIcon className="size-3" />
                  ) : chip === "rejected" ? (
                    <BanIcon className="size-3" />
                  ) : null}
                  {approvalStepLabel(step, t)}
                  {step.decidedBy && decidedByOther(step, t) ? (
                    <span className="font-normal opacity-80">
                      · {step.decidedBy.name}
                    </span>
                  ) : null}
                  {step.approverType === "CLIENT_EMAIL" ? (
                    <MailIcon className="size-3" />
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-3">
          <DecisionList steps={approval.steps} />
        </div>
      </section>

      {continued && (approval.canDecide || approval.canApproveOnBehalf) ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700"
        >
          <ClockIcon className="mt-0.5 size-4 shrink-0" />
          <span>{t.reviews.detail.continuedNotice(approval.seq)}</span>
        </p>
      ) : null}

      {lastResolved && lastSummary ? (
        <p
          className={`flex items-start gap-2 rounded-xl border p-4 text-sm ${DECISION_STYLES[lastResolved.status]}`}
        >
          {lastResolved.status === "APPROVED" ? (
            <CheckIcon className="mt-0.5 size-4 shrink-0" />
          ) : lastResolved.status === "REJECTED_TO_PREVIOUS" ? (
            <RefreshIcon className="mt-0.5 size-4 shrink-0" />
          ) : (
            <BanIcon className="mt-0.5 size-4 shrink-0" />
          )}
          <span>
            {lastSummary}
            {lastResolved.comments ? ` — “${lastResolved.comments}”` : ""}
          </span>
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">
              {t.reviews.detail.infoTitle}
            </h2>
            <dl className="mt-3 grid gap-4 sm:grid-cols-3">
              <Field label={t.reviews.detail.consultant}>
                {approval.consultant.name}
                {approval.consultant.jobTitle ? (
                  <span className="block text-xs font-normal text-ink-muted">
                    {approval.consultant.jobTitle}
                  </span>
                ) : null}
              </Field>
              <Field label={t.common.company}>
                {approval.company?.name ?? t.common.none}
              </Field>
              <Field label={t.reviews.detail.clientProject}>
                {approval.client.name}
                <span className="block text-xs font-normal text-ink-muted">
                  {approval.project.name}
                </span>
              </Field>
              <Field label={t.common.assignmentCode}>
                {approval.assignmentCode ?? t.common.none}
              </Field>
              <Field label={t.reviews.detail.week}>
                {formatWeekRange(approval.weekStart, locale)}
              </Field>
              <Field label={t.reviews.detail.hours}>
                <span className="text-brand-600">
                  {formatMinutes(approval.totalMinutes)}
                </span>
              </Field>
              {approval.amount !== null ? (
                <>
                  <Field label={t.reviews.detail.hourCost}>
                    {formatHourlyRates(
                      hourlyRatesOf(approval.pay, approval.hourlyRate),
                      approval.currency,
                      locale,
                    )}
                  </Field>
                  <Field label={t.reviews.detail.amount}>
                    <span className="text-brand-600">
                      {formatMoney(approval.amount, approval.currency, locale)}
                    </span>
                  </Field>
                </>
              ) : null}
            </dl>
          </section>

          {approval.pay && approval.pay.lines.length ? (
            <PayBreakdown pay={approval.pay} currency={approval.currency} />
          ) : null}

          {approval.canSeeActivities ? (
            <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
              <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
                {t.reviews.detail.dailyTitle}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th className="px-5 py-3 font-semibold text-ink">
                        {t.reviews.columns.day}
                      </th>
                      <th className="px-5 py-3 font-semibold text-ink">
                        {t.reviews.columns.activity}
                      </th>
                      <th className="px-5 py-3 text-right font-semibold text-ink">
                        {t.reviews.columns.hours}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {approval.days.map((day) => (
                      <tr key={day.date} className="align-top">
                        <td className="px-5 py-3 font-medium whitespace-nowrap text-ink">
                          {dayLabel(day.date, locale)}
                        </td>
                        <td className="px-5 py-3 text-ink-soft">
                          {day.activities.length === 0 ? (
                            <span className="text-ink-muted">
                              {t.reviews.noActivity}
                            </span>
                          ) : (
                            <ul className="space-y-1">
                              {day.activities.map((activity) => (
                                <li
                                  key={activity.lineNo}
                                  className="flex gap-2"
                                >
                                  <span className="text-ink-muted tabular-nums">
                                    {formatMinutes(activity.minutes)}
                                  </span>
                                  <span>{activity.activity}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {day.note ? (
                            <p className="mt-1 text-xs text-ink-muted">
                              {day.note}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-ink tabular-nums">
                          {formatMinutes(day.minutes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-line bg-surface-muted">
                      <td
                        colSpan={2}
                        className="px-5 py-3 text-right text-sm font-semibold text-ink"
                      >
                        {t.reviews.totalHours}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-semibold text-brand-600 tabular-nums">
                        {formatMinutes(approval.totalMinutes)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          ) : (
            <section className="overflow-hidden rounded-xl border border-line bg-navy-900 text-white shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-6 px-6 py-5">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                    {t.reviews.detail.payoutTitle}
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                    {formatMoney(approval.amount, approval.currency, locale)}
                  </p>
                </div>
                <dl className="flex gap-8">
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      {t.reviews.detail.hours}
                    </dt>
                    <dd className="mt-1 text-lg font-semibold tabular-nums">
                      {formatMinutes(approval.totalMinutes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      {t.reviews.detail.hourCost}
                    </dt>
                    <dd className="mt-1 text-lg font-semibold tabular-nums">
                      {formatHourlyRates(
                        hourlyRatesOf(approval.pay, approval.hourlyRate),
                        approval.currency,
                        locale,
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">
              {t.reviews.detail.actionsTitle}
            </h2>
            <div className="mt-3">
              {approval.canDecide ? (
                <DecideApprovalForm
                  approvalId={approval.approvalId}
                  consultantName={approval.consultant.name}
                  nextApproverLabel={
                    nextStep ? approvalStepLabel(nextStep, t) : null
                  }
                  canReturnToPrevious={approval.seq > 1}
                />
              ) : approval.canApproveOnBehalf ? (
                <ApproveOnBehalfForm
                  approvalId={approval.approvalId}
                  approverLabel={approvalStepLabel(approval, t)}
                />
              ) : (
                <p className="text-sm text-ink-muted">
                  {t.reviews.detail.cannotDecide}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <PaperclipIcon className="size-4" />
              {t.reviews.detail.evidenceTitle}
            </h2>
            {approval.attachments.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                {t.reviews.detail.evidenceEmpty}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {approval.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <EvidenceLink
                      href={`/evidence/${approval.approvalId}/${attachment.id}`}
                      attachment={attachment}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {approval.canSeeActivities ? (
            <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <PaperclipIcon className="size-4" />
                {t.reviews.detail.consultantEvidenceTitle}
              </h2>
              {approval.timesheetAttachments.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">
                  {t.reviews.detail.consultantEvidenceEmpty}
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {approval.timesheetAttachments.map((attachment) => (
                    <li key={attachment.id}>
                      <EvidenceLink
                        href={`/evidence/${approval.approvalId}/timesheet/${attachment.id}`}
                        attachment={attachment}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function dayLabel(isoDate: string, locale: Locale): string {
  const date = fromISODate(isoDate);
  if (!date) return isoDate;

  return `${formatWeekday(date, locale)} ${formatDayAndMonth(date, locale)}`;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-wide text-ink-muted uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{children}</dd>
    </div>
  );
}
