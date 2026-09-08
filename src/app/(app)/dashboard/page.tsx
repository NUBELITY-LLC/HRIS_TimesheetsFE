import type { Metadata } from "next";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { PersonalDashboard } from "@/components/dashboard/personal-dashboard";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { canViewAllTimesheets, roleName } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.dashboard.eyebrow };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getDictionary();

  const isAdmin = canViewAllTimesheets(user.role.code);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{t.dashboard.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.dashboard.title(roleName(user.role.code, t))}
        </h1>
      </header>

      {isAdmin ? <AdminDashboard /> : <PersonalDashboard />}
    </div>
  );
}
