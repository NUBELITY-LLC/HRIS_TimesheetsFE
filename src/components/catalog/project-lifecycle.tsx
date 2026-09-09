"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import { AlertIcon, CheckIcon, RefreshIcon, SpinnerIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import {
  closeProjectAction,
  reopenProjectAction,
} from "@/lib/catalog/actions";
import {
  INITIAL_PROJECT_LIFECYCLE_STATE,
  type ProjectLifecycleFormState,
} from "@/lib/catalog/form-state";

const DIALOG_CLASS =
  "m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40";

const SECONDARY_BUTTON_CLASS =
  "rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-60";

function Feedback({ state }: { state: ProjectLifecycleFormState }) {
  const t = useDictionary();

  if (state.status === "error" && state.message) {
    return (
      <p
        role="alert"
        aria-live="assertive"
        className="flex gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700"
      >
        <AlertIcon className="mt-0.5 size-4 shrink-0" />
        {state.message}
      </p>
    );
  }

  if (state.status !== "success" || !state.message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex gap-2 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-800"
    >
      <CheckIcon className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-1">
        <p className="font-medium">{state.message}</p>
        {state.summary ? (
          <>
            <p>
              {t.catalog.lifecycle.closedAssignments(
                state.summary.closedAssignments,
              )}
            </p>
            <p>
              {state.summary.strandedTimesheets > 0
                ? t.catalog.lifecycle.strandedTimesheets(
                    state.summary.strandedTimesheets,
                  )
                : t.catalog.lifecycle.noStranded}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

function CloseProject({
  projectId,
  activeAssignments,
  today,
}: {
  projectId: number;
  activeAssignments: number;
  today: string;
}) {
  const t = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const effectiveDateId = useId();
  const [state, formAction, isPending] = useActionState(
    closeProjectAction,
    INITIAL_PROJECT_LIFECYCLE_STATE,
  );

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted">{t.catalog.lifecycle.activeHint}</p>

      <Feedback state={state} />

      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-lg border border-danger-200 px-4 py-2 text-sm font-semibold text-danger-700 transition-colors hover:bg-danger-50"
      >
        {t.catalog.lifecycle.close}
      </button>

      <dialog ref={dialogRef} className={DIALOG_CLASS}>
        <form action={formAction} className="space-y-4 p-5" noValidate>
          <input type="hidden" name="projectId" value={projectId} />

          <h2 className="text-base font-semibold text-ink">
            {t.catalog.lifecycle.closeTitle}
          </h2>

          <p className="text-sm text-ink-soft">
            {t.catalog.lifecycle.closeBody}
          </p>

          <ul className="space-y-1.5 rounded-lg border border-line bg-surface-muted p-3 text-sm text-ink-soft">
            <li>
              {activeAssignments > 0
                ? t.catalog.lifecycle.closeAssignments(activeAssignments)
                : t.catalog.lifecycle.closeNoAssignments}
            </li>
            <li>{t.catalog.lifecycle.closeStrandedWarning}</li>
          </ul>

          <div className="space-y-1.5">
            <label
              htmlFor={effectiveDateId}
              className="block text-sm font-medium text-ink-soft"
            >
              {t.catalog.lifecycle.effectiveDate}
            </label>
            <input
              id={effectiveDateId}
              name="effectiveDate"
              type="date"
              required
              defaultValue={today}
              disabled={isPending}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink transition-colors focus:ring-2 focus:outline-none ${
                state.effectiveDateError
                  ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
                  : "border-line focus:border-brand-600 focus:ring-brand-100"
              }`}
            />
            {state.effectiveDateError ? (
              <p className="text-xs text-danger-600">
                {state.effectiveDateError}
              </p>
            ) : (
              <p className="text-xs text-ink-muted">
                {t.catalog.lifecycle.effectiveDateHint}
              </p>
            )}
          </div>

          {state.status === "error" && state.message ? (
            <p role="alert" className="flex gap-2 text-sm text-danger-700">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => dialogRef.current?.close()}
              className={SECONDARY_BUTTON_CLASS}
            >
              {t.catalog.lifecycle.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger-700 disabled:opacity-60"
            >
              {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
              {isPending
                ? t.catalog.lifecycle.closing
                : t.catalog.lifecycle.confirmClose}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

function ReopenProject({
  projectId,
  endDate,
}: {
  projectId: number;
  endDate: string;
}) {
  const t = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, isPending] = useActionState(
    reopenProjectAction,
    INITIAL_PROJECT_LIFECYCLE_STATE,
  );

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted">
        {t.catalog.lifecycle.closedHint(endDate)}
      </p>

      <Feedback state={state} />

      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={`flex items-center gap-2 ${SECONDARY_BUTTON_CLASS}`}
      >
        <RefreshIcon className="size-4" />
        {t.catalog.lifecycle.reopen}
      </button>

      <dialog ref={dialogRef} className={DIALOG_CLASS}>
        <form action={formAction} className="space-y-4 p-5">
          <input type="hidden" name="projectId" value={projectId} />

          <h2 className="text-base font-semibold text-ink">
            {t.catalog.lifecycle.reopenTitle}
          </h2>

          <p className="text-sm text-ink-soft">
            {t.catalog.lifecycle.reopenBody}
          </p>

          <p className="flex gap-2 rounded-lg border border-warn-200 bg-warn-50 p-3 text-sm text-warn-700">
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {t.catalog.lifecycle.reopenAssignmentsWarning}
          </p>

          {state.status === "error" && state.message ? (
            <p role="alert" className="flex gap-2 text-sm text-danger-700">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => dialogRef.current?.close()}
              className={SECONDARY_BUTTON_CLASS}
            >
              {t.catalog.lifecycle.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
              {isPending
                ? t.catalog.lifecycle.reopening
                : t.catalog.lifecycle.confirmReopen}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

export function ProjectLifecycle({
  projectId,
  isClosed,
  endDate,
  activeAssignments,
  today,
}: {
  projectId: number;
  isClosed: boolean;
  endDate: string;
  activeAssignments: number;
  today: string;
}) {
  return isClosed ? (
    <ReopenProject projectId={projectId} endDate={endDate} />
  ) : (
    <CloseProject
      projectId={projectId}
      activeAssignments={activeAssignments}
      today={today}
    />
  );
}
