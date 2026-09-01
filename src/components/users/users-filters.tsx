import { SearchIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";
import { roleCatalog } from "@/lib/users/roles";
import type { UserListFilters } from "@/lib/users/queries";

const SELECT_CLASS =
  "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";

export async function UsersFilters({ filters }: { filters: UserListFilters }) {
  const t = await getDictionary();
  const f = t.users.filters;

  return (
    <form
      action="/users"
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4"
    >
      <div className="min-w-56 flex-1 space-y-1.5">
        <label htmlFor="search" className="block text-xs font-medium text-ink-soft">
          {f.search}
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="search"
            name="search"
            type="search"
            maxLength={100}
            defaultValue={filters.search}
            placeholder={f.searchPlaceholder}
            className="w-full rounded-lg border border-line bg-white py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-muted/70 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="roleCode" className="block text-xs font-medium text-ink-soft">
          {f.role}
        </label>
        <select
          id="roleCode"
          name="roleCode"
          defaultValue={filters.roleCode}
          className={SELECT_CLASS}
        >
          <option value="">{f.allRoles}</option>
          {roleCatalog(t).map((role) => (
            <option key={role.code} value={role.code}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="status" className="block text-xs font-medium text-ink-soft">
          {f.status}
        </label>
        <select
          id="status"
          name="status"
          defaultValue={filters.status}
          className={SELECT_CLASS}
        >
          <option value="all">{f.statusAll}</option>
          <option value="active">{f.statusActive}</option>
          <option value="inactive">{f.statusInactive}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sortBy" className="block text-xs font-medium text-ink-soft">
          {f.sortBy}
        </label>
        <select
          id="sortBy"
          name="sortBy"
          defaultValue={filters.sortBy}
          className={SELECT_CLASS}
        >
          <option value="fullName">{f.sortFullName}</option>
          <option value="userName">{f.sortUserName}</option>
          <option value="email">{f.sortEmail}</option>
          <option value="lastLoginAt">{f.sortLastLogin}</option>
          <option value="id">{f.sortId}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sortDir" className="block text-xs font-medium text-ink-soft">
          {f.order}
        </label>
        <select
          id="sortDir"
          name="sortDir"
          defaultValue={filters.sortDir}
          className={SELECT_CLASS}
        >
          <option value="asc">{f.asc}</option>
          <option value="desc">{f.desc}</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        {t.common.apply}
      </button>
    </form>
  );
}
