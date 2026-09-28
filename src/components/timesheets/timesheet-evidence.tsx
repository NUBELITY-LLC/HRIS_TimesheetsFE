"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";

import {
  DownloadIcon,
  PaperclipIcon,
  PlusIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/components/icons";
import { useConfirm } from "@/components/ui/use-confirm";
import { useDictionary } from "@/i18n/provider";
import { EVIDENCE_ACCEPT } from "@/lib/approvals/form-state";
import { removeTimesheetEvidenceAction } from "@/lib/timesheets/actions";
import { evidenceIssue, formatFileSize } from "@/lib/timesheets/evidence";
import {
  TIMESHEET_EVIDENCE_MAX,
  type TimesheetAttachment,
} from "@/lib/timesheets/types";

export function TimesheetEvidence({
  timesheetId,
  attachments,
  files,
  onFilesChange,
  editable,
  disabled,
}: {
  timesheetId: number | null;
  attachments: TimesheetAttachment[];
  files: File[];
  onFilesChange: (files: File[]) => void;
  editable: boolean;
  disabled: boolean;
}) {
  const t = useDictionary();
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [isRemoving, startRemoving] = useTransition();
  const { confirm, dialog } = useConfirm();

  const total = attachments.length + files.length;
  const full = total >= TIMESHEET_EVIDENCE_MAX;

  if (!editable && attachments.length === 0) return null;

  function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    const issue = picked
      .map((file) => evidenceIssue(file, t))
      .find((message): message is string => message !== null);

    if (issue) {
      setProblem(issue);
      return;
    }

    if (total + picked.length > TIMESHEET_EVIDENCE_MAX) {
      setProblem(t.timesheets.evidence.limit(TIMESHEET_EVIDENCE_MAX));
      return;
    }

    setProblem(null);
    onFilesChange([...files, ...picked]);
  }

  function removePending(index: number) {
    setProblem(null);
    onFilesChange(files.filter((_, position) => position !== index));
  }

  async function removeSaved(attachmentId: number) {
    if (!timesheetId) return;

    const accepted = await confirm({
      title: t.confirmations.removeEvidence.title,
      confirmLabel: t.confirmations.removeEvidence.confirm,
      tone: "danger",
    });
    if (!accepted) return;

    setRemovingId(attachmentId);
    startRemoving(async () => {
      const result = await removeTimesheetEvidenceAction(
        timesheetId,
        attachmentId,
      );
      setProblem(result.ok ? null : result.message);
      setRemovingId(null);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-3 border-t border-line px-5 py-4">
      {dialog}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <PaperclipIcon className="size-4 text-ink-muted" />
            {t.timesheets.evidence.title}
            <span className="text-xs font-normal text-ink-muted">
              · {t.timesheets.evidence.optional}
            </span>
          </p>
          {editable ? (
            <p className="mt-0.5 text-xs text-ink-muted">
              {t.timesheets.evidence.hint(TIMESHEET_EVIDENCE_MAX)}
            </p>
          ) : null}
        </div>

        {editable ? (
          <>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={EVIDENCE_ACCEPT}
              multiple
              onChange={handlePick}
              disabled={disabled || full}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || full}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-surface-muted disabled:opacity-50"
            >
              <PlusIcon className="size-3.5" />
              {t.timesheets.evidence.add}
            </button>
          </>
        ) : null}
      </div>

      {attachments.length || files.length ? (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li
              key={`saved-${attachment.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
            >
              <a
                href={
                  timesheetId
                    ? `/timesheets/${timesheetId}/evidence/${attachment.id}`
                    : undefined
                }
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
              >
                <DownloadIcon className="size-4 shrink-0" />
                <span className="truncate font-medium">
                  {attachment.fileName}
                </span>
                <span className="shrink-0 text-xs text-ink-muted">
                  {formatFileSize(attachment.sizeBytes)}
                </span>
              </a>
              {editable ? (
                <button
                  type="button"
                  onClick={() => void removeSaved(attachment.id)}
                  disabled={disabled || isRemoving}
                  title={t.timesheets.evidence.remove}
                  aria-label={t.timesheets.evidence.remove}
                  className="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                >
                  {removingId === attachment.id ? (
                    <SpinnerIcon className="size-4 animate-spin" />
                  ) : (
                    <TrashIcon className="size-4" />
                  )}
                </button>
              ) : null}
            </li>
          ))}

          {files.map((file, index) => (
            <li
              key={`pending-${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-line px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
                <PaperclipIcon className="size-4 shrink-0 text-ink-muted" />
                <span className="truncate font-medium">{file.name}</span>
                <span className="shrink-0 text-xs text-ink-muted">
                  {formatFileSize(file.size)} ·{" "}
                  {t.timesheets.evidence.pending}
                </span>
              </span>
              <button
                type="button"
                onClick={() => removePending(index)}
                disabled={disabled}
                title={t.timesheets.evidence.remove}
                aria-label={t.timesheets.evidence.remove}
                className="grid size-8 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
              >
                <TrashIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-ink-muted">{t.timesheets.evidence.empty}</p>
      )}

      {problem ? (
        <p role="alert" className="text-xs text-danger-600">
          {problem}
        </p>
      ) : null}
    </div>
  );
}
