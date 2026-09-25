"use client";

import { useActionState } from "react";

import { SpinnerIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { markNotificationReadAction } from "@/lib/notifications/actions";
import { INITIAL_NOTIFICATION_ACTION_STATE } from "@/lib/notifications/form-state";

export function MarkReadButton({ notificationId }: { notificationId: number }) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    markNotificationReadAction,
    INITIAL_NOTIFICATION_ACTION_STATE,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="notificationId" value={notificationId} />
      <button
        type="submit"
        disabled={isPending}
        title={state.status === "error" ? (state.message ?? undefined) : undefined}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-60"
      >
        {isPending ? <SpinnerIcon className="size-3.5 animate-spin" /> : null}
        {t.notifications.markRead}
      </button>
    </form>
  );
}
