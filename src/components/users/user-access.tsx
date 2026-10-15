"use client";

import { useActionState } from "react";

import { AccessLinkResult } from "@/components/users/access-link-result";
import { AlertIcon, SendIcon, SpinnerIcon } from "@/components/icons";
import { sendAccessLinkAction } from "@/lib/users/actions";
import { INITIAL_ACCESS_LINK_STATE } from "@/lib/users/form-state";
import { formatDateTimeLong } from "@/lib/format/datetime";
import { useDictionary, useLocale } from "@/i18n/provider";

export function UserAccess({
  userId,
  email,
  isActive,
  invitationPending,
  invitationExpiresAt,
}: {
  userId: number;
  email: string;
  isActive: boolean;
  invitationPending: boolean;
  invitationExpiresAt: string | null;
}) {
  const t = useDictionary();
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(
    sendAccessLinkAction,
    INITIAL_ACCESS_LINK_STATE,
  );

  const kind = invitationPending ? "invitation" : "reset";
  const expires = formatDateTimeLong(invitationExpiresAt, locale, { empty: "", invalid: "" });

  let body: string;
  if (!isActive) body = t.users.access.inactiveBody;
  else if (!invitationPending) body = t.users.access.activeBody;
  else if (expires) body = t.users.access.pendingExpires(expires);
  else body = t.users.access.pendingExpired;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
        {t.users.access.section}
      </h2>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              {invitationPending ? t.users.access.pendingTitle : t.users.access.activeTitle}
              {invitationPending ? (
                <span className="rounded-full bg-warn-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-warn-700 uppercase">
                  {t.users.table.invitationPending}
                </span>
              ) : null}
            </p>
            <p className="text-sm text-ink-muted">{body}</p>
          </div>

          {isActive ? (
            <form action={formAction}>
              <input type="hidden" name="id" value={userId} />
              <input type="hidden" name="kind" value={kind} />
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <SpinnerIcon className="size-4 animate-spin" />
                ) : (
                  <SendIcon className="size-4" />
                )}
                {isPending
                  ? t.users.access.sending
                  : invitationPending
                    ? t.users.access.sendInvitation
                    : t.users.access.sendReset}
              </button>
            </form>
          ) : null}
        </div>

        {state.status === "error" && state.message ? (
          <div
            role="alert"
            className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-sm text-danger-700"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            <p className="font-medium">{state.message}</p>
          </div>
        ) : null}

        {state.status === "success" && state.result ? (
          <AccessLinkResult result={state.result} email={email} />
        ) : null}
      </div>
    </section>
  );
}
