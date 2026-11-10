"use client";

import { startTransition, useActionState, useId, useRef, useState } from "react";

import {
  AlertIcon,
  CheckIcon,
  CopyIcon,
  LockIcon,
  PaperclipIcon,
  PlusIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { EVIDENCE_ACCEPT } from "@/lib/approvals/form-state";
import { submitFeedbackAction } from "@/lib/feedback/actions";
import {
  FEEDBACK_BODY_MAX,
  FEEDBACK_CATEGORIES,
  FEEDBACK_EVIDENCE_MAX,
  INITIAL_SUBMIT_FEEDBACK_STATE,
} from "@/lib/feedback/types";
import { evidenceIssue, formatFileSize } from "@/lib/timesheets/evidence";
import {
  FIELD_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
} from "./styles";

function SentPanel({ code, onReset }: { code: string; onReset: () => void }) {
  const t = useDictionary();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4" role="status">
      <div className="flex gap-3 rounded-lg border border-success-200 bg-success-50 p-4 text-sm text-success-800">
        <CheckIcon className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-semibold">{t.feedback.sent.title}</p>
          <p className="mt-1">{t.feedback.sent.body}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-muted px-4 py-3">
        <div>
          <p className="text-xs text-ink-muted">{t.feedback.sent.code}</p>
          <p className="font-mono text-lg font-semibold tracking-wider text-ink">{code}</p>
        </div>
        <button type="button" onClick={() => void copy()} className={SECONDARY_BUTTON_CLASS}>
          {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          {copied ? t.feedback.sent.copied : t.feedback.sent.copy}
        </button>
      </div>

      <button type="button" onClick={onReset} className={SECONDARY_BUTTON_CLASS}>
        {t.feedback.sent.another}
      </button>
    </div>
  );
}

export function SubmitFeedbackForm() {
  const t = useDictionary();
  const ids = { category: useId(), body: useId(), evidence: useId() };
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, isPending] = useActionState(
    submitFeedbackAction,
    INITIAL_SUBMIT_FEEDBACK_STATE,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [problem, setProblem] = useState<string | null>(null);
  const [dismissedCode, setDismissedCode] = useState<string | null>(null);
  const [length, setLength] = useState(0);

  if (state.status === "sent" && state.trackingCode && state.trackingCode !== dismissedCode) {
    return (
      <SentPanel
        code={state.trackingCode}
        onReset={() => {
          setDismissedCode(state.trackingCode);
          setFiles([]);
          setLength(0);
        }}
      />
    );
  }

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    const issue = picked.map((file) => evidenceIssue(file, t)).find(Boolean);
    if (issue) {
      setProblem(issue);
      return;
    }
    if (files.length + picked.length > FEEDBACK_EVIDENCE_MAX) {
      setProblem(t.feedback.form.limit(FEEDBACK_EVIDENCE_MAX));
      return;
    }

    setProblem(null);
    setFiles([...files, ...picked]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.delete("evidence");
    files.forEach((file) => data.append("evidence", file, file.name));
    startTransition(() => formAction(data));
  }

  const evidenceError = problem ?? state.fieldErrors.evidence ?? null;
  const full = files.length >= FEEDBACK_EVIDENCE_MAX;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <p className="flex items-center gap-2 rounded-lg border border-line bg-surface-muted px-3.5 py-3 text-sm text-ink-soft">
        <LockIcon className="size-4 shrink-0 text-ink-muted" />
        {t.feedback.notice}
      </p>

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor={ids.category} className={LABEL_CLASS}>
          {t.feedback.form.category}
        </label>
        <select
          id={ids.category}
          name="category"
          defaultValue=""
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.category)}
          className={FIELD_CLASS}
        >
          <option value="" disabled>
            {t.feedback.form.categoryPlaceholder}
          </option>
          {FEEDBACK_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {t.feedback.categories[category]}
            </option>
          ))}
        </select>
        {state.fieldErrors.category ? (
          <p className="text-xs text-danger-600">{state.fieldErrors.category}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={ids.body} className={LABEL_CLASS}>
          {t.feedback.form.body}
        </label>
        <textarea
          id={ids.body}
          name="body"
          rows={7}
          maxLength={FEEDBACK_BODY_MAX}
          disabled={isPending}
          onChange={(event) => setLength(event.target.value.length)}
          aria-invalid={Boolean(state.fieldErrors.body)}
          className={`${FIELD_CLASS} resize-y`}
        />
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-danger-600">{state.fieldErrors.body ?? ""}</span>
          <span className="shrink-0 text-ink-muted">
            {length > 0
              ? `${length.toLocaleString()} / ${FEEDBACK_BODY_MAX.toLocaleString()}`
              : t.feedback.form.bodyHint(FEEDBACK_BODY_MAX)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <PaperclipIcon className="size-4 text-ink-muted" />
              {t.feedback.form.evidence}
              <span className="text-xs font-normal text-ink-muted">
                · {t.feedback.form.optional}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {t.feedback.form.evidenceHint(FEEDBACK_EVIDENCE_MAX)}
            </p>
          </div>
          <input
            ref={inputRef}
            id={ids.evidence}
            type="file"
            accept={EVIDENCE_ACCEPT}
            multiple
            onChange={handlePick}
            disabled={isPending || full}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending || full}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-50"
          >
            <PlusIcon className="size-3.5" />
            {t.feedback.form.addEvidence}
          </button>
        </div>

        {files.length ? (
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-line px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
                  <PaperclipIcon className="size-4 shrink-0 text-ink-muted" />
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {formatFileSize(file.size)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setProblem(null);
                    setFiles(files.filter((_, position) => position !== index));
                  }}
                  disabled={isPending}
                  title={t.feedback.form.remove}
                  aria-label={t.feedback.form.remove}
                  className="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                >
                  <TrashIcon className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {evidenceError ? (
          <p role="alert" className="text-xs text-danger-600">
            {evidenceError}
          </p>
        ) : null}
      </div>

      <button type="submit" disabled={isPending} className={PRIMARY_BUTTON_CLASS}>
        {isPending ? (
          <>
            <SpinnerIcon className="size-4 animate-spin" />
            {t.feedback.form.submitting}
          </>
        ) : (
          t.feedback.form.submit
        )}
      </button>
    </form>
  );
}
