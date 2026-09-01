"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import {
  ClockIcon,
  DashboardIcon,
  HistoryIcon,
  LogoutIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { logoutAction } from "@/lib/auth/actions";
import { canManageUsers } from "@/lib/users/roles";
import type { AuthenticatedUser } from "@/lib/api/types";

type NavItem = {
  key: "dashboard" | "timesheets" | "history" | "users" | "account";
  href: string;
  icon: typeof DashboardIcon;
  available: boolean;
  userAdminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: DashboardIcon, available: true },
  { key: "timesheets", href: "/timesheets", icon: ClockIcon, available: false },
  { key: "history", href: "/history", icon: HistoryIcon, available: false },
  {
    key: "users",
    href: "/users",
    icon: UsersIcon,
    available: true,
    userAdminOnly: true,
  },
  { key: "account", href: "/settings", icon: SettingsIcon, available: true },
];

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Sidebar({ user }: { user: AuthenticatedUser }) {
  const pathname = usePathname();
  const t = useDictionary();

  const navItems = NAV_ITEMS.filter(
    (item) => !item.userAdminOnly || canManageUsers(user.role.code),
  );

  return (
    <aside className="flex shrink-0 flex-col bg-navy-900 lg:sticky lg:top-0 lg:h-dvh lg:w-64">
      <div className="px-5 py-5">
        <BrandLogo />
      </div>

      <nav className="flex-1 px-3" aria-label={t.common.appName}>
        <ul className="space-y-1">
          {navItems.map(({ key, href, icon: Icon, available }) => {
            const label = t.nav[key];
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            const content = (
              <>
                <Icon className="size-[18px]" />
                {label}
              </>
            );

            return (
              <li key={key}>
                {available ? (
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-navy-700 text-white"
                        : "text-slate-400 hover:bg-navy-800 hover:text-slate-200"
                    }`}
                  >
                    {content}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600"
                  >
                    {content}
                    <span className="ml-auto rounded-full bg-navy-800 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                      {t.common.soon}
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg bg-navy-800 px-3 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {initials(user.fullName)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">
              {user.fullName}
            </span>
            <span className="block truncate text-xs text-slate-400">
              {user.jobTitle ?? t.roles[user.role.code as "ADMIN"]?.name ?? user.role.name}
            </span>
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label={t.common.signOut}
              title={t.common.signOut}
              className="grid size-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-navy-700 hover:text-white"
            >
              <LogoutIcon className="size-[18px]" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
