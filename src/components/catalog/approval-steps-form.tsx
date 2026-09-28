"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import {
  AlertIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { saveApprovalStepsAction } from "@/lib/catalog/actions";
import {
  emptyApprovalStepDraft,
  toApprovalStepDraft,
  INITIAL_APPROVAL_STEPS_FORM_STATE,
  type ApprovalStepDraft,
} from "@/lib/catalog/form-state";
import type {
  ApprovalStepView,
  ClientView,
  PersonView,
} from "@/lib/catalog/types";
import type { ApproverType } from "@/lib/timesheets/types";
import { APPROVER_ROLE_CODES, roleName } from "@/lib/users/roles";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";
import { useConfirmedSubmit } from "@/components/ui/use-confirm";
import { submitKeepingValues } from "@/lib/forms/submit";

const APPROVER_TYPES: ApproverType[] = ["CLIENT_EMAIL", "USER", "ROLE"];

const INPUT_BASE =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted disabled:text-ink-muted";

const LABEL_CLASS =
  "block text-[10px] font-semibold tracking-wide text-ink-muted uppercase";

const MOVE_BUTTON_CLASS =
  "grid size-8 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-soft disabled:opacity-40 disabled:hover:bg-transparent";

function inputClass(hasError: boolean): string {
  return `${INPUT_BASE} ${
    hasError
      ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
      : "border-line"
  }`;
}

export function ApprovalStepsForm({
  projectId,
  steps,
  minApprovers,
  maxApprovers,
  approvers,
  clients,
  projectClientId,
  projectManager,
}: {
  projectId: number;
  steps: ApprovalStepView[];
  minApprovers: number;
  maxApprovers: number;
  approvers: PersonView[];
  clients: ClientView[];
  projectClientId: number | null;
  projectManager: PersonView | null;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    saveApprovalStepsAction,
    INITIAL_APPROVAL_STEPS_FORM_STATE,
  );
  const feedback = useFeedbackSlot();
  const { guard: confirmGuard, dialog: confirmDialog } = useConfirmedSubmit();

  const projectManagerId = projectManager ? String(projectManager.id) : null;

  function coversProjectManager(row: ApprovalStepDraft): boolean {
    if (!projectManagerId) return false;
    if (row.approverType === "USER") return row.userId === projectManagerId;
    if (row.approverType !== "CLIENT_EMAIL") return false;

    const client = clients.find(
      (candidate) => String(candidate.id) === row.clientId,
    );
    return client?.user ? String(client.user.id) === projectManagerId : false;
  }

  function withProjectManager(
    current: ApprovalStepDraft[],
  ): ApprovalStepDraft[] {
    if (!projectManagerId || current.some(coversProjectManager)) {
      return current;
    }

    return [
      ...current,
      {
        ...emptyApprovalStepDraft("project-manager", "USER"),
        userId: projectManagerId,
      },
    ];
  }

  const nextKey = useRef(0);
  const [rows, setRows] = useState<ApprovalStepDraft[]>(() =>
    withProjectManager(
      steps.length
        ? steps.map((step, index) =>
            toApprovalStepDraft(step, `saved-${index}`),
          )
        : projectClientId
          ? [
              emptyApprovalStepDraft(
                "project-client",
                "CLIENT_EMAIL",
                String(projectClientId),
              ),
            ]
          : [],
    ),
  );
  const managerPending =
    steps.length > 0 &&
    projectManagerId !== null &&
    !steps
      .map((step, index) => toApprovalStepDraft(step, `saved-${index}`))
      .some(coversProjectManager);
  const [syncedAt, setSyncedAt] = useState(0);

  if (state.savedAt > syncedAt && state.steps) {
    setSyncedAt(state.savedAt);
    setRows(state.steps);
  }

  function updateRow(index: number, changes: Partial<ApprovalStepDraft>) {
    setRows((current) =>
      current.map((row, position) =>
        position === index ? { ...row, ...changes } : row,
      ),
    );
  }

  function addRow() {
    nextKey.current += 1;
    setRows((current) => [
      ...current,
      emptyApprovalStepDraft(`new-${nextKey.current}`),
    ]);
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, position) => position !== index));
  }

  function moveRow(index: number, offset: number) {
    setRows((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;

      const reordered = [...current];
      [reordered[index], reordered[target]] = [
        reordered[target],
        reordered[index],
      ];
      return reordered;
    });
  }

  function isProjectManagerRow(row: ApprovalStepDraft): boolean {
    return row.approverType === "USER" && row.userId === projectManagerId;
  }

  function isProjectClientRow(row: ApprovalStepDraft): boolean {
    return (
      projectClientId !== null &&
      row.approverType === "CLIENT_EMAIL" &&
      row.clientId === String(projectClientId)
    );
  }

  const projectClient =
    clients.find((client) => client.id === projectClientId) ?? null;
  function rowClientEmail(row: ApprovalStepDraft): string | null {
    const client = clients.find(
      (candidate) => String(candidate.id) === row.clientId,
    );
    return client?.contactEmail ?? null;
  }

  const usedClientIds = new Set(
    rows
      .filter((row) => row.approverType === "CLIENT_EMAIL" && row.clientId)
      .map((row) => row.clientId),
  );
  const isComplete = rows.length >= minApprovers && rows.length <= maxApprovers;

  return (
    <form onSubmit={submitKeepingValues(
        feedback.track(formAction),
        confirmGuard({
          title: t.confirmations.saveFlow.title,
          body: t.confirmations.saveFlow.body,
          confirmLabel: t.confirmations.saveFlow.confirm,
        }),
      )} className="space-y-5" noValidate>
      {confirmDialog}
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="stepCount" value={rows.length} />
      {projectClientId ? (
        <input
          type="hidden"
          name="projectClientId"
          value={projectClientId}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">{t.catalog.approvals.intro}</p>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isComplete
              ? "bg-success-50 text-success-700"
              : "bg-danger-50 text-danger-700"
          }`}
        >
          {isComplete
            ? t.catalog.approvals.complete
            : t.catalog.approvals.incomplete}
        </span>
      </div>

      {feedback.visible && state.status === "success" && state.message ? (
        <p
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-800"
        >
          <CheckIcon className="size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}

      {feedback.visible && state.status === "error" && state.message ? (
        <p
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700"
        >
          <AlertIcon className="size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}

      {projectClient && !projectClient.contactEmail ? (
        <p className="flex gap-2 rounded-lg border border-warn-200 bg-warn-50 p-3 text-sm text-warn-700">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            {t.catalog.approvals.projectClientMissingEmail}{" "}
            <Link
              href={`/managers/${projectClient.id}`}
              className="font-semibold underline underline-offset-2"
            >
              {t.catalog.clients.edit}
            </Link>
          </span>
        </p>
      ) : null}

      {managerPending && state.savedAt === 0 ? (
        <p className="flex gap-2 rounded-lg border border-warn-200 bg-warn-50 p-3 text-sm text-warn-700">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>{t.catalog.approvals.projectManagerPending}</span>
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink-muted">
          {t.catalog.approvals.noApprovers}
        </p>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, index) => {
            const stepError = state.stepErrors[index];
            const clientLocked = isProjectClientRow(row);
            const managerLocked = isProjectManagerRow(row);
            const locked = clientLocked || managerLocked;

            return (
              <li
                key={row.key}
                className={`space-y-3 rounded-lg border p-4 ${
                  stepError ? "border-danger-200 bg-danger-50/40" : "border-line"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                    {t.catalog.approvals.stepLabel(index + 1)}
                    {clientLocked ? (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {t.catalog.approvals.projectClientLane}
                      </span>
                    ) : null}
                    {managerLocked ? (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {t.catalog.approvals.projectManagerLane}
                      </span>
                    ) : null}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveRow(index, -1)}
                      disabled={isPending || index === 0}
                      title={t.catalog.approvals.moveUp}
                      aria-label={t.catalog.approvals.moveUp}
                      className={MOVE_BUTTON_CLASS}
                    >
                      <ChevronUpIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(index, 1)}
                      disabled={isPending || index === rows.length - 1}
                      title={t.catalog.approvals.moveDown}
                      aria-label={t.catalog.approvals.moveDown}
                      className={MOVE_BUTTON_CLASS}
                    >
                      <ChevronDownIcon className="size-4" />
                    </button>
                    {locked ? null : (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={isPending}
                        title={t.catalog.approvals.removeStep}
                        aria-label={t.catalog.approvals.removeStep}
                        className="grid size-8 place-items-center rounded-md text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-40"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label
                      htmlFor={`stepType-${index}`}
                      className={LABEL_CLASS}
                    >
                      {t.catalog.approvals.typeLabel}
                    </label>
                    <select
                      id={`stepType-${index}`}
                      name={locked ? undefined : `stepType-${index}`}
                      value={row.approverType}
                      disabled={isPending || locked}
                      onChange={(event) =>
                        updateRow(index, {
                          approverType: event.target.value as ApproverType,
                        })
                      }
                      className={inputClass(false)}
                    >
                      {APPROVER_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {t.catalog.approvals.types[type]}
                        </option>
                      ))}
                    </select>
                    {locked ? (
                      <input
                        type="hidden"
                        name={`stepType-${index}`}
                        value={row.approverType}
                      />
                    ) : null}
                  </div>

                  {row.approverType === "USER" ? (
                    <div className="space-y-1">
                      <label
                        htmlFor={`stepUserId-${index}`}
                        className={LABEL_CLASS}
                      >
                        {t.catalog.approvals.approverLabel}
                      </label>
                      <select
                        id={`stepUserId-${index}`}
                        name={locked ? undefined : `stepUserId-${index}`}
                        value={row.userId}
                        disabled={isPending || locked || approvers.length === 0}
                        onChange={(event) =>
                          updateRow(index, { userId: event.target.value })
                        }
                        className={inputClass(Boolean(stepError))}
                      >
                        <option value="">
                          {t.catalog.approvals.approverPlaceholder}
                        </option>
                        {managerLocked &&
                        projectManager &&
                        !approvers.some(
                          (approver) => approver.id === projectManager.id,
                        ) ? (
                          <option value={projectManager.id}>
                            {projectManager.fullName}
                          </option>
                        ) : null}
                        {approvers.map((approver) => (
                          <option key={approver.id} value={approver.id}>
                            {approver.fullName}
                          </option>
                        ))}
                      </select>
                      {locked ? (
                        <input
                          type="hidden"
                          name={`stepUserId-${index}`}
                          value={row.userId}
                        />
                      ) : null}
                      {approvers.length === 0 ? (
                        <p className="text-xs text-ink-muted">
                          {t.catalog.approvals.noCandidates}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {row.approverType === "ROLE" ? (
                    <div className="space-y-1">
                      <label
                        htmlFor={`stepRoleCode-${index}`}
                        className={LABEL_CLASS}
                      >
                        {t.catalog.approvals.roleLabel}
                      </label>
                      <select
                        id={`stepRoleCode-${index}`}
                        name={`stepRoleCode-${index}`}
                        value={row.roleCode}
                        disabled={isPending}
                        onChange={(event) =>
                          updateRow(index, { roleCode: event.target.value })
                        }
                        className={inputClass(Boolean(stepError))}
                      >
                        <option value="">
                          {t.catalog.approvals.rolePlaceholder}
                        </option>
                        {APPROVER_ROLE_CODES.map((code) => (
                          <option key={code} value={code}>
                            {roleName(code, t)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {row.approverType === "CLIENT_EMAIL" ? (
                    <div className="space-y-1">
                      <label
                        htmlFor={`stepClientId-${index}`}
                        className={LABEL_CLASS}
                      >
                        {t.catalog.approvals.clientLabel}
                      </label>
                      <select
                        id={`stepClientId-${index}`}
                        name={locked ? undefined : `stepClientId-${index}`}
                        value={row.clientId}
                        disabled={isPending || locked}
                        onChange={(event) =>
                          updateRow(index, { clientId: event.target.value })
                        }
                        className={inputClass(Boolean(stepError))}
                      >
                        <option value="">
                          {t.catalog.approvals.clientPlaceholder}
                        </option>
                        {clients.map((client) => (
                          <option
                            key={client.id}
                            value={client.id}
                            disabled={
                              !client.contactEmail ||
                              (String(client.id) !== row.clientId &&
                                usedClientIds.has(String(client.id)))
                            }
                          >
                            {client.clientName}
                            {client.contactEmail
                              ? ""
                              : ` · ${t.catalog.approvals.clientWithoutEmail}`}
                          </option>
                        ))}
                      </select>
                      {locked ? (
                        <input
                          type="hidden"
                          name={`stepClientId-${index}`}
                          value={row.clientId}
                        />
                      ) : null}
                      {rowClientEmail(row) ? (
                        <p className="text-xs text-ink-muted">
                          {t.catalog.approvals.clientEmail(
                            rowClientEmail(row) as string,
                          )}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {row.approverType === "CLIENT_EMAIL" ? null : (
                  <div className="space-y-1">
                    <label
                      htmlFor={`stepName-${index}`}
                      className={LABEL_CLASS}
                    >
                      {t.catalog.approvals.displayNameLabel}
                    </label>
                    <input
                      id={`stepName-${index}`}
                      name={`stepName-${index}`}
                      type="text"
                      maxLength={150}
                      value={row.approverName}
                      disabled={isPending}
                      placeholder={t.catalog.approvals.displayNamePlaceholder}
                      onChange={(event) =>
                        updateRow(index, { approverName: event.target.value })
                      }
                      className={inputClass(false)}
                    />
                  </div>
                  )}
                </div>

                {stepError ? (
                  <p className="text-xs text-danger-600">{stepError}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}

      <p className="text-xs text-ink-muted">
        {t.catalog.approvals.addClientHint}{" "}
        <Link
          href="/managers"
          className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-700"
        >
          {t.catalog.approvals.manageClients}
        </Link>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">
          {t.catalog.approvals.counter(rows.length, maxApprovers, minApprovers)}
        </p>
        <button
          type="button"
          onClick={addRow}
          disabled={isPending || rows.length >= maxApprovers}
          className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-60"
        >
          <PlusIcon className="size-4" />
          {t.catalog.approvals.addStep}
        </button>
      </div>

      {rows.length >= maxApprovers ? (
        <p className="text-xs text-ink-muted">
          {t.catalog.approvals.maxReached(maxApprovers)}
        </p>
      ) : null}

      {rows.length < minApprovers ? (
        <p className="flex items-center gap-2 text-xs text-danger-700">
          <AlertIcon className="size-3.5 shrink-0" />
          {t.catalog.approvals.incompleteHint(minApprovers)}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
        {isPending ? t.catalog.approvals.saving : t.catalog.approvals.save}
      </button>
    </form>
  );
}
