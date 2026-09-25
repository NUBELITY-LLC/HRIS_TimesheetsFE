"use client";

import { useEffect, useId, useRef } from "react";

import { AlertIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";

export type ConfirmTone = "default" | "danger";

const TONES: Record<ConfirmTone, { icon: string; action: string }> = {
  default: {
    icon: "bg-brand-50 text-brand-600",
    action: "bg-brand-600 hover:bg-brand-700",
  },
  danger: {
    icon: "bg-danger-50 text-danger-600",
    action: "bg-danger-600 hover:bg-danger-700",
  },
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  tone = "default",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useDictionary();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  const styles = TONES[tone];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={body ? bodyId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-navy-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex gap-4">
          <span
            aria-hidden="true"
            className={`grid size-10 shrink-0 place-items-center rounded-full ${styles.icon}`}
          >
            <AlertIcon className="size-5" />
          </span>
          <div className="min-w-0 pt-1">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {body ? (
              <p id={bodyId} className="mt-1.5 text-sm text-ink-muted">
                {body}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
          >
            {cancelLabel ?? t.common.cancel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${styles.action}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
