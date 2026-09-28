"use client";

import { useActionState } from "react";

import { BanIcon, RefreshIcon, SpinnerIcon, TrashIcon } from "@/components/icons";
import {
  deactivateUserAction,
  deleteUserAction,
  reactivateUserAction,
} from "@/lib/users/actions";
import { INITIAL_ROW_ACTION_STATE } from "@/lib/users/form-state";
import { useConfirmedSubmit } from "@/components/ui/use-confirm";
import { useDictionary } from "@/i18n/provider";
import { submitKeepingValues } from "@/lib/forms/submit";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";

type UserStatusActionsProps = {
  userId: number;
  fullName: string;
  isActive: boolean;
  canDelete: boolean;
  disabled: boolean;
  disabledReason?: string;
};

export function UserStatusActions({
  userId,
  fullName,
  isActive,
  canDelete,
  disabled,
  disabledReason,
}: UserStatusActionsProps) {
  if (disabled) {
    return (
      <span
        title={disabledReason}
        className="cursor-not-allowed text-xs text-ink-muted"
      >
        —
      </span>
    );
  }

  return (
    <span className="flex items-center justify-end gap-1">
      <StatusButton
        userId={userId}
        fullName={fullName}
        isActive={isActive}
      />
      {!isActive && canDelete ? (
        <DeleteButton userId={userId} fullName={fullName} />
      ) : null}
    </span>
  );
}

function StatusButton({
  userId,
  fullName,
  isActive,
}: {
  userId: number;
  fullName: string;
  isActive: boolean;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    isActive ? deactivateUserAction : reactivateUserAction,
    INITIAL_ROW_ACTION_STATE,
  );
  const feedback = useFeedbackSlot();
  const { guard, dialog } = useConfirmedSubmit();

  return (
    <form
      onSubmit={submitKeepingValues(feedback.track(formAction), guard(
        isActive
          ? {
              title: t.users.confirmDeactivate(fullName),
              confirmLabel: t.users.table.deactivate,
              tone: "danger",
            }
          : null,
      ))}
    >
      {dialog}
      <input type="hidden" name="id" value={userId} />
      <button
        type="submit"
        disabled={isPending}
        title={state.status === "error" ? (state.message ?? undefined) : undefined}
        className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
          isActive
            ? "text-danger-600 hover:bg-danger-50"
            : "text-success-700 hover:bg-success-50"
        }`}
      >
        {isPending ? (
          <SpinnerIcon className="size-3.5 animate-spin" />
        ) : isActive ? (
          <BanIcon className="size-3.5" />
        ) : (
          <RefreshIcon className="size-3.5" />
        )}
        {isActive ? t.users.table.deactivate : t.users.table.reactivate}
      </button>
    </form>
  );
}

function DeleteButton({
  userId,
  fullName,
}: {
  userId: number;
  fullName: string;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    deleteUserAction,
    INITIAL_ROW_ACTION_STATE,
  );
  const feedback = useFeedbackSlot();
  const { guard, dialog } = useConfirmedSubmit();

  return (
    <form
      onSubmit={submitKeepingValues(feedback.track(formAction), guard({
        title: t.users.confirmDelete(fullName),
        body: t.users.confirmDeleteBody,
        confirmLabel: t.users.table.delete,
        tone: "danger",
      }))}
    >
      {dialog}
      <input type="hidden" name="id" value={userId} />
      <button
        type="submit"
        disabled={isPending}
        title={
          state.status === "error"
            ? (state.message ?? undefined)
            : t.users.table.delete
        }
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-danger-600 transition-colors hover:bg-danger-50 disabled:opacity-60"
      >
        {isPending ? (
          <SpinnerIcon className="size-3.5 animate-spin" />
        ) : (
          <TrashIcon className="size-3.5" />
        )}
        {t.users.table.delete}
      </button>
    </form>
  );
}
