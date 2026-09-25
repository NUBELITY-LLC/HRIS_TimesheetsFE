import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon } from "@/components/icons";
import { NoAccess } from "@/components/users/no-access";
import { UserProjects } from "@/components/users/user-projects";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { fetchAllProjects } from "@/lib/catalog/queries";
import { fetchUser, fetchUserProjects } from "@/lib/users/queries";
import {
  canHaveProject,
  canManageRole,
  canManageUsers,
  roleName,
} from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.users.form.projectsSection };
}

export default async function UserProjectsPage({
  params,
}: PageProps<"/users/[id]/projects">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManageUsers(actor)) {
    return <NoAccess message={t.users.noAccessBody} />;
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  const found = await fetchUser(userId);

  if (!found.ok) {
    if (found.reason === "not-found") notFound();
    return <NoAccess message={t.users.noAccessUserGeneric} />;
  }

  const { user } = found;

  if (!canManageRole(actor.role.code, user.role.code)) {
    return (
      <NoAccess message={t.users.cannotManageRole(roleName(user.role.code, t))} />
    );
  }

  if (!canHaveProject(user.role.code)) {
    return (
      <NoAccess
        message={t.users.cannotHaveProjects(roleName(user.role.code, t))}
      />
    );
  }

  const [assignments, projects] = await Promise.all([
    fetchUserProjects(user.id),
    fetchAllProjects(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          href={`/users/${user.id}`}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeftIcon className="size-4" />
          {t.users.form.backToProfile}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {user.fullName}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {user.userName} · {roleName(user.role.code, t)}
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-3.5">
          <h2 className="text-sm font-semibold text-ink">
            {t.users.form.projectsSection}
          </h2>
          <p className="text-xs text-ink-muted">
            {t.users.form.projectsCount(
              assignments.filter((item) => item.isActive).length,
            )}
          </p>
        </div>
        <div className="p-5">
          <UserProjects
            userId={user.id}
            assignments={assignments}
            projects={projects}
          />
        </div>
      </section>
    </div>
  );
}
