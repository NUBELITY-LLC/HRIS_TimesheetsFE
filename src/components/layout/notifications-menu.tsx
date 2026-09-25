"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import { BellIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { useDictionary, useLocale } from "@/i18n/provider";
import { formatDateTime } from "@/lib/format/datetime";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { INITIAL_NOTIFICATION_ACTION_STATE } from "@/lib/notifications/form-state";
import { isKnownKind, type AppNotification } from "@/lib/notifications/types";

export function NotificationsMenu({
  notifications,
  unreadCount,
}: {
  notifications: AppNotification[];
  unreadCount: number;
}) {
  const t = useDictionary();
  const locale = useLocale();
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hasUnread = unreadCount > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          hasUnread
            ? `${t.nav.notifications} · ${t.notifications.unreadCount(unreadCount)}`
            : t.nav.notifications
        }
        title={t.nav.notifications}
        onClick={() => setOpen((value) => !value)}
        className={`relative grid size-9 place-items-center rounded-full border transition-colors ${
          open
            ? "border-brand-300 bg-brand-50 text-brand-700"
            : "border-line bg-surface text-ink-soft hover:bg-surface-muted hover:text-ink"
        }`}
      >
        <BellIcon className="size-[18px]" />
        {hasUnread ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 grid min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white tabular-nums"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={t.notifications.title}
          className="absolute top-full right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
        >
          <header className="flex items-center justify-between gap-3 border-b border-line bg-surface-muted px-4 py-2.5">
            <span className="text-sm font-semibold text-ink">
              {t.notifications.title}
            </span>
            {hasUnread ? <MarkAllButton /> : null}
          </header>

          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <BellIcon className="mx-auto size-5 text-ink-muted" />
              <p className="mt-2 text-sm font-medium text-ink">
                {t.notifications.emptyTitle}
              </p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`px-4 py-3 ${
                    notification.isRead ? "" : "bg-brand-50/40"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                        notification.isRead ? "bg-transparent" : "bg-brand-600"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {notification.title}
                      </p>
                      {notification.body ? (
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {notification.body}
                        </p>
                      ) : null}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-ink-muted">
                        <span>
                          {isKnownKind(notification.kind)
                            ? t.notifications.kinds[notification.kind]
                            : t.notifications.kinds.OTHER}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {formatDateTime(notification.createdAt, locale, {
                            empty: t.common.none,
                            invalid: t.common.unknown,
                          })}
                        </span>
                        {notification.isRead ? null : (
                          <MarkReadInlineButton
                            notificationId={notification.id}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <footer className="border-t border-line bg-surface-muted px-4 py-2.5 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              {t.notifications.seeAll}
            </Link>
          </footer>
        </div>
      ) : null}
    </div>
  );
}

function MarkAllButton() {
  const t = useDictionary();
  const [isPending, setPending] = useState(false);

  return (
    <form
      action={async () => {
        setPending(true);
        await markAllNotificationsReadAction();
        setPending(false);
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:opacity-60"
      >
        {isPending ? (
          <SpinnerIcon className="size-3 animate-spin" />
        ) : (
          <CheckIcon className="size-3" />
        )}
        {t.notifications.markAll}
      </button>
    </form>
  );
}

function MarkReadInlineButton({ notificationId }: { notificationId: number }) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(
    markNotificationReadAction,
    INITIAL_NOTIFICATION_ACTION_STATE,
  );

  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="notificationId" value={notificationId} />
      <button
        type="submit"
        disabled={isPending}
        title={state.status === "error" ? (state.message ?? undefined) : undefined}
        className="font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:opacity-60"
      >
        {t.notifications.markRead}
      </button>
    </form>
  );
}
