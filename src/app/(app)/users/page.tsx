import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, PencilIcon, PlusIcon } from "@/components/icons";
import { UserStatusActions } from "@/components/users/user-status-actions";
import { UsersFilters } from "@/components/users/users-filters";
import { requireUser } from "@/lib/auth/session";
import {
  DEFAULT_USER_FILTERS,
  USER_SORT_DIRECTIONS,
  USER_SORT_FIELDS,
  USER_STATUSES,
  fetchUsers,
  type UserListFilters,
  type UserSortDirection,
  type UserSortField,
  type UserStatus,
} from "@/lib/users/queries";
import { canManageRole, canManageUsers, roleName, ROLE_ADMIN } from "@/lib/users/roles";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatDateTime } from "@/lib/format/datetime";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.users.eyebrow };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseFilters(params: Record<string, string | string[] | undefined>): UserListFilters {
  const page = Number(firstParam(params.page));
  const status = firstParam(params.status) as UserStatus;
  const sortBy = firstParam(params.sortBy) as UserSortField;
  const sortDir = firstParam(params.sortDir) as UserSortDirection;

  return {
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_USER_FILTERS.page,
    pageSize: DEFAULT_USER_FILTERS.pageSize,
    search: firstParam(params.search).slice(0, 100),
    roleCode: firstParam(params.roleCode).toUpperCase().slice(0, 30),
    status: USER_STATUSES.includes(status) ? status : DEFAULT_USER_FILTERS.status,
    sortBy: USER_SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_USER_FILTERS.sortBy,
    sortDir: USER_SORT_DIRECTIONS.includes(sortDir)
      ? sortDir
      : DEFAULT_USER_FILTERS.sortDir,
  };
}

function pageHref(filters: UserListFilters, page: number): string {
  const params = new URLSearchParams({
    page: String(page),
    status: filters.status,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });
  if (filters.search) params.set("search", filters.search);
  if (filters.roleCode) params.set("roleCode", filters.roleCode);
  return `/users?${params.toString()}`;
}

export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  const actor = await requireUser();
  const t = await getDictionary();
  const locale = await getLocale();

  if (!canManageUsers(actor.role.code)) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <div>
            <h1 className="text-sm font-semibold text-ink">
              {t.users.noAccessTitle}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {t.users.noAccessBody(roleName(actor.role.code, t))}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filters = parseFilters(await searchParams);
  const result = await fetchUsers(filters);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{t.users.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            {t.users.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            {actor.role.code === ROLE_ADMIN
              ? t.users.subtitleAll
              : t.users.subtitleLimited}
          </p>
        </div>
        <Link
          href="/users/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <PlusIcon className="size-4" />
          {t.users.newUser}
        </Link>
      </header>

      <UsersFilters filters={filters} />

      {!result.ok ? (
        <div className="flex gap-3 rounded-xl border border-danger-200 bg-danger-50 p-5 text-sm text-danger-700">
          <AlertIcon className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">{t.users.loadErrorTitle}</p>
            <p className="mt-1">{result.message}</p>
          </div>
        </div>
      ) : result.users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-sm font-medium text-ink">{t.users.emptyTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{t.users.emptyBody}</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-3xl border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-muted text-left">
                    <th className="px-5 py-3 font-semibold text-ink">
                      {t.users.table.user}
                    </th>
                    <th className="px-5 py-3 font-semibold text-ink">
                      {t.users.table.role}
                    </th>
                    <th className="px-5 py-3 font-semibold text-ink">
                      {t.users.table.status}
                    </th>
                    <th className="px-5 py-3 font-semibold text-ink">
                      {t.users.table.lastLogin}
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-ink">
                      {t.users.table.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {result.users.map((user) => {
                    const manageable = canManageRole(actor.role.code, user.role.code);
                    const isSelf = user.id === actor.id;

                    return (
                      <tr key={user.id} className="align-middle">
                        <td className="px-5 py-3.5">
                          <span className="block font-medium text-ink">
                            {user.fullName}
                            {isSelf ? (
                              <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-brand-700 uppercase">
                                {t.common.you}
                              </span>
                            ) : null}
                          </span>
                          <span className="block text-ink-muted">
                            {user.userName} · {user.email}
                          </span>
                          {user.mustChangePassword ? (
                            <span className="mt-1 inline-block rounded-full bg-warn-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-warn-700 uppercase">
                              {t.users.table.pendingPassword}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-3.5 text-ink-soft">
                          {roleName(user.role.code, t)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                              user.isActive
                                ? "bg-success-50 text-success-700"
                                : "bg-surface-muted text-ink-muted"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                user.isActive ? "bg-success-700" : "bg-ink-muted"
                              }`}
                            />
                            {user.isActive
                              ? t.users.table.active
                              : t.users.table.inactive}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-ink-muted">
                          {formatDateTime(user.lastLoginAt, locale, {
                            empty: t.common.never,
                            invalid: t.common.unknown,
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {manageable ? (
                              <Link
                                href={`/users/${user.id}`}
                                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
                              >
                                <PencilIcon className="size-3.5" />
                                {t.users.table.edit}
                              </Link>
                            ) : null}
                            <UserStatusActions
                              userId={user.id}
                              fullName={user.fullName}
                              isActive={user.isActive}
                              disabled={!manageable || isSelf}
                              disabledReason={
                                isSelf
                                  ? t.users.cannotDeactivateSelf
                                  : t.users.cannotManageRole(
                                      roleName(user.role.code, t),
                                    )
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink-muted">
              {t.users.summary(
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
      )}
    </div>
  );
}
