import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, CheckIcon } from "@/components/icons";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { markAllNotificationsReadAction } from "@/lib/notifications/actions";
import {
  DEFAULT_NOTIFICATION_FILTERS,
  fetchNotifications,
  type NotificationFilters,
} from "@/lib/notifications/queries";
import type { NotificationStatusFilter } from "@/lib/notifications/types";

const STATUS_FILTERS: NotificationStatusFilter[] = ["all", "unread", "read"];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.notifications.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFilters(
  params: Record<string, string | string[] | undefined>,
): NotificationFilters {
  const page = Number(firstParam(params.page));
  const status = firstParam(params.status);

  return {
    ...DEFAULT_NOTIFICATION_FILTERS,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    status:
      STATUS_FILTERS.find((candidate) => candidate === status) ??
      DEFAULT_NOTIFICATION_FILTERS.status,
  };
}

function pageHref(filters: NotificationFilters, page: number): string {
  return `/notifications?status=${filters.status}&page=${page}`;
}

export default async function NotificationsPage({
  searchParams,
}: PageProps<"/notifications">) {
  await requireUser();
  const t = await getDictionary();

  const filters = parseFilters(await searchParams);
  const result = await fetchNotifications(filters);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{t.notifications.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {t.notifications.title}
          </h1>
        </div>
        <form action={markAllNotificationsReadAction}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-muted"
          >
            <CheckIcon className="size-4" />
            {t.notifications.markAll}
          </button>
        </form>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label={t.notifications.eyebrow}>
        {STATUS_FILTERS.map((status) => (
          <Link
            key={status}
            href={`/notifications?status=${status}`}
            aria-current={filters.status === status ? "page" : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              filters.status === status
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-line text-ink-soft hover:bg-surface-muted"
            }`}
          >
            {t.notifications.filters[status]}
          </Link>
        ))}
      </nav>

      {result.ok ? (
        <>
          <NotificationsList
            notifications={result.notifications}
            empty={{
              title: t.notifications.emptyTitle,
              body: t.notifications.emptyBody,
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-muted">
              {t.notifications.summary(
                result.pagination.total,
                result.pagination.page,
                Math.max(result.pagination.totalPages, 1),
              )}
            </p>
            <div className="flex gap-2">
              {result.pagination.page > 1 ? (
                <Link
                  href={pageHref(filters, result.pagination.page - 1)}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.previous}
                </Link>
              ) : null}
              {result.pagination.page < result.pagination.totalPages ? (
                <Link
                  href={pageHref(filters, result.pagination.page + 1)}
                  className="rounded-lg border border-line px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-surface-muted"
                >
                  {t.common.next}
                </Link>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-danger-600" />
          <div>
            <p className="text-sm font-semibold text-danger-700">
              {t.notifications.loadErrorTitle}
            </p>
            <p className="mt-1 text-sm text-danger-700">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
