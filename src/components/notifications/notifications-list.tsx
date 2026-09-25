import { BellIcon } from "@/components/icons";
import { MarkReadButton } from "@/components/notifications/notification-row";
import { getDictionary, getLocale } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDateTime } from "@/lib/format/datetime";
import { isKnownKind, type AppNotification } from "@/lib/notifications/types";

function kindLabel(kind: string | null, t: Dictionary): string {
  return isKnownKind(kind) ? t.notifications.kinds[kind] : t.notifications.kinds.OTHER;
}

export async function NotificationsList({
  notifications,
  empty,
}: {
  notifications: AppNotification[];
  empty: { title: string; body: string };
}) {
  const t = await getDictionary();
  const locale = await getLocale();

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-5 py-12 text-center shadow-sm">
        <BellIcon className="mx-auto size-6 text-ink-muted" />
        <p className="mt-3 text-sm font-medium text-ink">{empty.title}</p>
        <p className="mt-1 text-sm text-ink-muted">{empty.body}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={`flex flex-wrap items-start gap-x-4 gap-y-2 rounded-xl border p-4 shadow-sm ${
            notification.isRead
              ? "border-line bg-surface"
              : "border-brand-200 bg-brand-50/40"
          }`}
        >
          <span className="min-w-0 flex-1 space-y-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">
                {notification.title}
              </span>
              {notification.isRead ? null : (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                  {t.notifications.unread}
                </span>
              )}
            </span>
            {notification.body ? (
              <span className="block text-sm text-ink-soft">
                {notification.body}
              </span>
            ) : null}
            <span className="block text-xs text-ink-muted">
              {kindLabel(notification.kind, t)} ·{" "}
              {formatDateTime(notification.createdAt, locale, {
                empty: t.common.none,
                invalid: t.common.unknown,
              })}
            </span>
          </span>
          {notification.isRead ? null : (
            <MarkReadButton notificationId={notification.id} />
          )}
        </li>
      ))}
    </ul>
  );
}
