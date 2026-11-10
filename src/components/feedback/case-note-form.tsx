"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";

import { AlertIcon, SpinnerIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { addFeedbackNoteAction } from "@/lib/feedback/actions";
import {
  FEEDBACK_BODY_MAX,
  FEEDBACK_NOTE_KINDS,
  INITIAL_FEEDBACK_ACTION_STATE,
  type FeedbackNoteKind,
} from "@/lib/feedback/types";
import { FIELD_CLASS, LABEL_CLASS, PRIMARY_BUTTON_CLASS } from "./styles";

export function CaseNoteForm({ caseId }: { caseId: number }) {
  const t = useDictionary();
  const bodyId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    addFeedbackNoteAction,
    INITIAL_FEEDBACK_ACTION_STATE,
  );
  const [kind, setKind] = useState<FeedbackNoteKind>("INTERNAL");

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.savedAt, state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3" noValidate>
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="kind" value={kind} />

      <div role="radiogroup" className="flex flex-wrap gap-2">
        {FEEDBACK_NOTE_KINDS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={kind === option}
            onClick={() => setKind(option)}
            disabled={isPending}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              kind === option
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-line text-ink-soft hover:bg-surface-muted"
            }`}
          >
            {t.feedback.detail.noteKinds[option]}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-muted">{t.feedback.detail.noteKindHints[kind]}</p>

      <div className="space-y-1.5">
        <label htmlFor={bodyId} className={LABEL_CLASS}>
          {t.feedback.detail.noteLabel}
        </label>
        <textarea
          id={bodyId}
          name="body"
          rows={3}
          maxLength={FEEDBACK_BODY_MAX}
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.body)}
          className={`${FIELD_CLASS} resize-y`}
        />
        {state.fieldErrors.body ? (
          <p className="text-xs text-danger-600">{state.fieldErrors.body}</p>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-danger-700">
          <AlertIcon className="size-4 shrink-0" />
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className={PRIMARY_BUTTON_CLASS}>
        {isPending ? (
          <>
            <SpinnerIcon className="size-4 animate-spin" />
            {t.feedback.detail.adding}
          </>
        ) : (
          t.feedback.detail.addNote
        )}
      </button>
    </form>
  );
}
