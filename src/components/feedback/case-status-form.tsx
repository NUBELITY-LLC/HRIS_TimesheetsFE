"use client";

import { useActionState, useId, useState } from "react";

import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { updateFeedbackStatusAction } from "@/lib/feedback/actions";
import {
  FEEDBACK_BODY_MAX,
  FEEDBACK_STATUSES,
  INITIAL_FEEDBACK_ACTION_STATE,
  type FeedbackStatus,
} from "@/lib/feedback/types";
import { FIELD_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from "./styles";

export function CaseStatusForm({
  caseId,
  status,
  resolution,
}: {
  caseId: number;
  status: FeedbackStatus;
  resolution: string | null;
}) {
  const t = useDictionary();
  const ids = { status: useId(), resolution: useId() };
  const [state, formAction, isPending] = useActionState(
    updateFeedbackStatusAction,
    INITIAL_FEEDBACK_ACTION_STATE,
  );
  const [selected, setSelected] = useState<FeedbackStatus>(status);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="caseId" value={caseId} />

      <div className="space-y-1.5">
        <label htmlFor={ids.status} className={LABEL_CLASS}>
          {t.feedback.detail.status}
        </label>
        <select
          id={ids.status}
          name="status"
          value={selected}
          onChange={(event) => setSelected(event.target.value as FeedbackStatus)}
          disabled={isPending}
          className={FIELD_CLASS}
        >
          {FEEDBACK_STATUSES.map((option) => (
            <option key={option} value={option}>
              {t.feedback.statuses[option]}
            </option>
          ))}
        </select>
      </div>

      {selected === "RESOLVED" ? (
        <div className="space-y-1.5">
          <label htmlFor={ids.resolution} className={LABEL_CLASS}>
            {t.feedback.detail.resolution}
          </label>
          <textarea
            id={ids.resolution}
            name="resolution"
            rows={4}
            maxLength={FEEDBACK_BODY_MAX}
            defaultValue={resolution ?? ""}
            disabled={isPending}
            aria-invalid={Boolean(state.fieldErrors.resolution)}
            className={`${FIELD_CLASS} resize-y`}
          />
          <p
            className={`text-xs ${state.fieldErrors.resolution ? "text-danger-600" : "text-ink-muted"}`}
          >
            {state.fieldErrors.resolution ?? t.feedback.detail.resolutionHint}
          </p>
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-danger-700">
          <AlertIcon className="size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p role="status" className="flex items-center gap-2 text-sm text-success-700">
          <CheckIcon className="size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className={PRIMARY_BUTTON_CLASS}>
        {isPending ? (
          <>
            <SpinnerIcon className="size-4 animate-spin" />
            {t.feedback.detail.saving}
          </>
        ) : (
          t.feedback.detail.saveStatus
        )}
      </button>
    </form>
  );
}
