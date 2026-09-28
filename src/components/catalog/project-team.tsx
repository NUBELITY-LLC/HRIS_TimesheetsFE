"use client";

import { useActionState, useId, useState } from "react";

import {
  AlertIcon,
  CheckIcon,
  PlusIcon,
  RefreshIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/components/icons";
import {
  ContractTypeSelect,
  CurrencySelect,
  RatePeriodSelect,
} from "@/components/rates/rate-selects";
import { useDictionary } from "@/i18n/provider";
import {
  assignProjectMemberAction,
  removeProjectAssignmentAction,
  updateProjectAssignmentAction,
} from "@/lib/catalog/actions";
import {
  INITIAL_ASSIGNMENT_FORM_STATE,
  INITIAL_ASSIGNMENT_ROW_STATE,
} from "@/lib/catalog/form-state";
import {
  ASSIGNMENT_CODE_MAX,
  type PersonView,
  type ProjectAssignmentView,
} from "@/lib/catalog/types";
import { roleName } from "@/lib/users/roles";
import { submitKeepingValues } from "@/lib/forms/submit";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";

const INPUT_BASE =
  "rounded-lg border bg-white px-3 py-2 text-sm text-ink transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted disabled:text-ink-muted";

const LABEL_CLASS =
  "block text-[10px] font-semibold tracking-wide text-ink-muted uppercase";

function inputClass(hasError: boolean, width = "w-full"): string {
  return `${width} ${INPUT_BASE} ${
    hasError
      ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
      : "border-line"
  }`;
}

function sameRate(input: string, current: number): boolean {
  const normalized = input.trim().replace(",", ".");
  const parsed = Number(normalized);
  return normalized !== "" && Number.isFinite(parsed)
    ? parsed === current
    : normalized === String(current);
}

function RemoveMember({
  projectId,
  assignmentId,
  consultantId,
}: {
  projectId: number;
  assignmentId: number;
  consultantId: number | null;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    removeProjectAssignmentAction,
    INITIAL_ASSIGNMENT_ROW_STATE,
  );
  const feedback = useFeedbackSlot();

  return (
    <form onSubmit={submitKeepingValues(feedback.track(formAction))} className="relative">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="assignmentId" value={assignmentId} />
      {consultantId ? (
        <input type="hidden" name="consultantId" value={consultantId} />
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        title={t.catalog.team.removePerson}
        aria-label={t.catalog.team.removePerson}
        className="grid size-9 place-items-center rounded-md text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
      >
        {isPending ? (
          <SpinnerIcon className="size-4 animate-spin" />
        ) : (
          <TrashIcon className="size-4" />
        )}
      </button>
      {feedback.visible && state.status === "error" && state.message ? (
        <p className="absolute top-full right-0 mt-1 text-xs whitespace-nowrap text-danger-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

type ProjectBounds = { start: string | null; end: string | null };

function MemberRow({
  projectId,
  assignment,
  bounds,
}: {
  projectId: number;
  assignment: ProjectAssignmentView;
  bounds: ProjectBounds;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    updateProjectAssignmentAction,
    INITIAL_ASSIGNMENT_FORM_STATE,
  );
  const feedback = useFeedbackSlot();

  const ids = {
    assignmentCode: useId(),
    payRate: useId(),
    startDate: useId(),
    endDate: useId(),
  };
  const { fieldErrors } = state;

  const [draft, setDraft] = useState<{
    assignmentCode: string;
    payRate: string;
    currency: string;
    ratePeriod: string;
    contractType: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  const isDirty =
    draft !== null &&
    (!sameRate(draft.payRate, assignment.payRate) ||
      draft.currency !== assignment.currency ||
      draft.ratePeriod !== assignment.ratePeriod ||
      draft.contractType !== assignment.payTerms.contractType ||
      draft.startDate !== assignment.startDate ||
      draft.endDate !== (assignment.endDate ?? "") ||
      draft.assignmentCode !== (assignment.assignmentCode ?? ""));

  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    setDraft({
      assignmentCode: String(data.get("assignmentCode") ?? ""),
      payRate: String(data.get("payRate") ?? ""),
      currency: String(data.get("currency") ?? ""),
      ratePeriod: String(data.get("ratePeriod") ?? ""),
      contractType: String(data.get("contractType") ?? ""),
      startDate: String(data.get("startDate") ?? ""),
      endDate: String(data.get("endDate") ?? ""),
    });
  }

  return (
    <div className="space-y-2 border-t border-line py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">
            {assignment.consultant?.fullName ?? t.common.unknown}
          </p>
          <p className="text-xs text-ink-muted">
            {assignment.consultant?.roleCode
              ? roleName(assignment.consultant.roleCode, t)
              : t.common.none}
            {assignment.isActive ? "" : ` · ${t.users.form.inactiveAssignment}`}
          </p>
        </div>

        <div className="flex items-end gap-2">
          <form
            onSubmit={submitKeepingValues(feedback.track(formAction))}
            onChange={handleChange}
            className="flex flex-wrap items-end gap-2"
            noValidate
          >
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="assignmentId" value={assignment.id} />
            {assignment.consultant ? (
              <input
                type="hidden"
                name="consultantId"
                value={assignment.consultant.id}
              />
            ) : null}

            <div className="space-y-1">
              <label htmlFor={ids.assignmentCode} className={LABEL_CLASS}>
                {t.users.form.assignmentCode}
              </label>
              <input
                id={ids.assignmentCode}
                name="assignmentCode"
                type="text"
                maxLength={ASSIGNMENT_CODE_MAX}
                placeholder={t.users.form.assignmentCodePlaceholder}
                defaultValue={assignment.assignmentCode ?? ""}
                disabled={isPending}
                className={inputClass(
                  Boolean(fieldErrors.assignmentCode),
                  "w-36",
                )}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={ids.payRate} className={LABEL_CLASS}>
                {t.users.form.payRate}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id={ids.payRate}
                  name="payRate"
                  type="text"
                  inputMode="decimal"
                  maxLength={13}
                  defaultValue={assignment.payRate}
                  disabled={isPending}
                  className={`tabular-nums ${inputClass(Boolean(fieldErrors.payRate), "w-24")}`}
                />
                <CurrencySelect
                  compact
                  defaultValue={assignment.currency}
                  disabled={isPending}
                  className={inputClass(false, "w-24")}
                />
                <RatePeriodSelect
                  defaultValue={assignment.ratePeriod}
                  disabled={isPending}
                  className={inputClass(false, "w-28")}
                />
                <ContractTypeSelect
                  defaultValue={assignment.payTerms.contractType}
                  disabled={isPending}
                  className={inputClass(false, "w-32")}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor={ids.startDate} className={LABEL_CLASS}>
                {t.users.form.projectStart}
              </label>
              <input
                id={ids.startDate}
                name="startDate"
                type="date"
                defaultValue={assignment.startDate}
                min={bounds.start ?? undefined}
                max={bounds.end ?? undefined}
                disabled={isPending}
                className={inputClass(Boolean(fieldErrors.startDate), "w-40")}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={ids.endDate} className={LABEL_CLASS}>
                {t.users.form.projectEnd}
              </label>
              <input
                id={ids.endDate}
                name="endDate"
                type="date"
                defaultValue={assignment.endDate ?? ""}
                min={bounds.start ?? undefined}
                max={bounds.end ?? undefined}
                disabled={isPending}
                className={inputClass(Boolean(fieldErrors.endDate), "w-40")}
              />
            </div>

            <button
              type="submit"
              name="intent"
              value="save"
              disabled={isPending}
              title={t.users.form.saveAssignment}
              aria-label={t.users.form.saveAssignment}
              className={`grid size-9 place-items-center rounded-md border transition-all duration-200 disabled:opacity-50 ${
                isDirty
                  ? "animate-save-pulse border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
                  : "border-line text-ink-soft hover:bg-surface-muted"
              }`}
            >
              {isPending ? (
                <SpinnerIcon className="size-4 animate-spin" />
              ) : (
                <CheckIcon className="size-4" />
              )}
            </button>

            {assignment.isActive ? null : (
              <button
                type="submit"
                name="intent"
                value="reactivate"
                disabled={isPending}
                className="flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-50"
              >
                <RefreshIcon className="size-3.5" />
                {t.users.form.reactivateAssignment}
              </button>
            )}

          </form>

          {assignment.isActive ? (
            <RemoveMember
              projectId={projectId}
              assignmentId={assignment.id}
              consultantId={assignment.consultant?.id ?? null}
            />
          ) : null}
        </div>
      </div>

      {feedback.visible && state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-xs text-danger-700"
        >
          <AlertIcon className="size-3.5 shrink-0" />
          {state.message}
        </p>
      ) : null}

      {feedback.visible && state.status === "success" && state.message ? (
        <p className="flex items-center gap-2 text-xs text-success-700">
          <CheckIcon className="size-3.5 shrink-0" />
          {state.message}
        </p>
      ) : null}

      {[
        fieldErrors.assignmentCode,
        fieldErrors.payRate,
        fieldErrors.startDate,
        fieldErrors.endDate,
      ]
        .filter((error): error is string => Boolean(error))
        .map((error) => (
          <p key={error} className="text-xs text-danger-600">
            {error}
          </p>
        ))}
    </div>
  );
}

export function ProjectTeam({
  projectId,
  assignments,
  people,
  projectStartDate,
  projectEndDate,
  locked = false,
}: {
  projectId: number;
  assignments: ProjectAssignmentView[];
  people: PersonView[];
  projectStartDate: string | null;
  projectEndDate: string | null;
  locked?: boolean;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    assignProjectMemberAction,
    INITIAL_ASSIGNMENT_FORM_STATE,
  );
  const feedback = useFeedbackSlot();
  const [seenState, setSeenState] = useState(state);
  const [formKey, setFormKey] = useState(0);
  const bounds: ProjectBounds = {
    start: projectStartDate,
    end: projectEndDate,
  };

  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "success") setFormKey((current) => current + 1);
  }

  const ids = {
    consultantId: useId(),
    assignmentCode: useId(),
    payRate: useId(),
    startDate: useId(),
    endDate: useId(),
  };
  const { fieldErrors } = state;
  const assigned = new Set(
    assignments
      .filter((item) => item.isActive)
      .map((item) => item.consultant?.id)
      .filter((id): id is number => typeof id === "number"),
  );
  const available = people.filter((person) => !assigned.has(person.id));
  const disabled = isPending || locked || available.length === 0;

  return (
    <div className="space-y-5">
      {assignments.length === 0 ? (
        <p className="text-sm text-ink-muted">{t.catalog.team.empty}</p>
      ) : (
        <div>
          {assignments.map((assignment) => (
            <MemberRow
              key={assignment.id}
              projectId={projectId}
              assignment={assignment}
              bounds={bounds}
            />
          ))}
        </div>
      )}

      {locked ? null : (
        <form
          key={formKey}
          onSubmit={submitKeepingValues(feedback.track(formAction))}
          className="space-y-4 rounded-lg border border-line p-4"
          noValidate
        >
          <input type="hidden" name="projectId" value={projectId} />

          {feedback.visible && state.status === "success" && state.message ? (
            <p className="flex items-center gap-2 text-sm text-success-700">
              <CheckIcon className="size-4 shrink-0" />
              {state.message}
            </p>
          ) : null}

          {feedback.visible && state.status === "error" && state.message ? (
            <p
              role="alert"
              className="flex items-center gap-2 text-sm text-danger-700"
            >
              <AlertIcon className="size-4 shrink-0" />
              {state.message}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor={ids.consultantId}
                className="block text-xs font-medium text-ink-soft"
              >
                {t.catalog.team.person}
              </label>
              <select
                id={ids.consultantId}
                name="consultantId"
                disabled={disabled}
                className={inputClass(Boolean(fieldErrors.consultantId))}
              >
                <option value="">{t.catalog.team.personPlaceholder}</option>
                {available.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.fullName}
                    {person.roleCode
                      ? ` · ${roleName(person.roleCode, t)}`
                      : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.consultantId ? (
                <p className="text-xs text-danger-600">
                  {fieldErrors.consultantId}
                </p>
              ) : available.length === 0 ? (
                <p className="text-xs text-ink-muted">
                  {t.catalog.team.noPeopleAvailable}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={ids.startDate}
                className="block text-xs font-medium text-ink-soft"
              >
                {t.users.form.projectStart}
              </label>
              <input
                id={ids.startDate}
                name="startDate"
                type="date"
                defaultValue={bounds.start ?? ""}
                min={bounds.start ?? undefined}
                max={bounds.end ?? undefined}
                disabled={disabled}
                className={inputClass(Boolean(fieldErrors.startDate))}
              />
              {fieldErrors.startDate ? (
                <p className="text-xs text-danger-600">
                  {fieldErrors.startDate}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={ids.endDate}
                className="block text-xs font-medium text-ink-soft"
              >
                {t.users.form.projectEnd}
              </label>
              <input
                id={ids.endDate}
                name="endDate"
                type="date"
                defaultValue={bounds.end ?? ""}
                min={bounds.start ?? undefined}
                max={bounds.end ?? undefined}
                disabled={disabled}
                className={inputClass(Boolean(fieldErrors.endDate))}
              />
              {fieldErrors.endDate ? (
                <p className="text-xs text-danger-600">{fieldErrors.endDate}</p>
              ) : null}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor={ids.payRate}
                className="block text-xs font-medium text-ink-soft"
              >
                {t.users.form.assignmentRate}
              </label>
              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <input
                  id={ids.payRate}
                  name="payRate"
                  type="text"
                  inputMode="decimal"
                  maxLength={13}
                  placeholder="0"
                  disabled={disabled}
                  className={`tabular-nums ${inputClass(Boolean(fieldErrors.payRate), "min-w-0 flex-1")}`}
                />
                <CurrencySelect
                  disabled={disabled}
                  className={inputClass(false, "w-full sm:w-52")}
                />
                <RatePeriodSelect
                  disabled={disabled}
                  className={inputClass(false, "w-full sm:w-36")}
                />
                <ContractTypeSelect
                  disabled={disabled}
                  className={inputClass(false, "w-full sm:w-36")}
                />
              </div>
              {fieldErrors.payRate ? (
                <p className="text-xs text-danger-600">{fieldErrors.payRate}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={ids.assignmentCode}
                className="block text-xs font-medium text-ink-soft"
              >
                {t.users.form.assignmentCode}
              </label>
              <input
                id={ids.assignmentCode}
                name="assignmentCode"
                type="text"
                maxLength={ASSIGNMENT_CODE_MAX}
                placeholder={t.users.form.assignmentCodePlaceholder}
                disabled={disabled}
                className={inputClass(Boolean(fieldErrors.assignmentCode))}
              />
              {fieldErrors.assignmentCode ? (
                <p className="text-xs text-danger-600">
                  {fieldErrors.assignmentCode}
                </p>
              ) : (
                <p className="text-xs text-ink-muted">
                  {t.users.form.assignmentCodeHint}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            {isPending ? (
              <SpinnerIcon className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}
            {isPending ? t.catalog.team.adding : t.catalog.team.addPerson}
          </button>
        </form>
      )}
    </div>
  );
}
