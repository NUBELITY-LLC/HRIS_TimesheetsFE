"use client";

import { useActionState } from "react";

import { BanIcon, RefreshIcon, SpinnerIcon } from "@/components/icons";
import {
  deactivateUserAction,
  reactivateUserAction,
} from "@/lib/users/actions";
import { INITIAL_ROW_ACTION_STATE } from "@/lib/users/form-state";
import { useDictionary } from "@/i18n/provider";

type UserStatusActionsProps = {
  userId: number;
  fullName: string;
  isActive: boolean;
  disabled: boolean;
  disabledReason?: string;
};

export function UserStatusActions({
  userId,
  fullName,
  isActive,
  disabled,
  disabledReason,
}: UserStatusActionsProps) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    isActive ? deactivateUserAction : reactivateUserAction,
    INITIAL_ROW_ACTION_STATE,
  );

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
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!isActive) return;
        const confirmed = window.confirm(t.users.confirmDeactivate(fullName));
        if (!confirmed) event.preventDefault();
      }}
    >
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
