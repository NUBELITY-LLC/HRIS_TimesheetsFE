import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon, BriefcaseIcon } from "@/components/icons";
import { NoAccess } from "@/components/users/no-access";
import { UserForm } from "@/components/users/user-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { fetchUser, fetchUserProjects } from "@/lib/users/queries";
import {
  canGrantRole,
  canHaveProject,
  canManageRole,
  canManageUsers,
  manageableRoles,
  roleName,
} from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.users.edit.title };
}

export default async function EditUserPage({ params }: PageProps<"/users/[id]">) {
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

  const isSelf = user.id === actor.id;
  const roles = manageableRoles(actor.role.code, t);
  const showProjects = canHaveProject(user.role.code);
  const assignments = showProjects ? await fetchUserProjects(user.id) : [];
  const activeAssignments = assignments.filter((item) => item.isActive).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          href="/users"
          className="flex w-fit items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink-soft"
        >
          <ArrowLeftIcon className="size-4" />
          {t.users.eyebrow}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          {user.fullName}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {user.userName} · {user.email} · {roleName(user.role.code, t)}
          {user.mustChangePassword ? ` · ${t.users.edit.pendingPassword}` : ""}
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.users.form.section}
        </h2>
        <div className="p-5">
          <UserForm
            mode="edit"
            actor={actor}
            userId={user.id}
            roles={roles}
            canChangeRole={!isSelf && canGrantRole(actor.role.code, user.role.code)}
            canChangePermissions={!isSelf}
            canChangeStatus={!isSelf}
            defaultValues={{
              fullName: user.fullName,
              userName: user.userName,
              email: user.email,
              roleCode: user.role.code,
              permissions: user.permissions,
              jobTitle: user.jobTitle ?? "",
              isActive: user.isActive,
              projectId: "",
              projectPayRate: "",
              projectStartDate: "",
              projectEndDate: "",
              projectAssignmentCode: "",
            }}
          />
        </div>
      </section>

      {showProjects ? (
        <Link
          href={`/users/${user.id}/projects`}
          className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm transition-colors hover:bg-surface-muted"
        >
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="size-5 shrink-0 text-ink-muted" />
            <div>
              <p className="text-sm font-semibold text-ink">
                {t.users.form.projectsSection}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {t.users.form.projectsCount(activeAssignments)}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-brand-600">
            {t.users.form.manageProjects}
          </span>
        </Link>
      ) : null}
    </div>
  );
}
