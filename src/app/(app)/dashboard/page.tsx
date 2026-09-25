import type { Metadata } from "next";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { PersonalDashboard } from "@/components/dashboard/personal-dashboard";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import {
  canSubmitTimesheets,
  canViewTeamDashboard,
  roleName,
} from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.dashboard.eyebrow };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getDictionary();

  const showTeam = canViewTeamDashboard(user);
  const showPersonal = canSubmitTimesheets(user);
  const labelled = showTeam && showPersonal;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{t.dashboard.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {t.dashboard.title(roleName(user.role.code, t))}
        </h1>
      </header>

      {showTeam ? (
        <section className="space-y-4">
          {labelled ? (
            <h2 className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
              {t.dashboard.teamSection}
            </h2>
          ) : null}
          <AdminDashboard />
        </section>
      ) : null}

      {showPersonal ? (
        <section className="space-y-4">
          {labelled ? (
            <h2 className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
              {t.dashboard.personalSection}
            </h2>
          ) : null}
          <PersonalDashboard />
        </section>
      ) : null}
    </div>
  );
}
