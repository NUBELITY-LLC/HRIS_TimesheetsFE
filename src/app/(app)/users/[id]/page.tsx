import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AlertIcon, ArrowLeftIcon } from "@/components/icons";
import { UserForm } from "@/components/users/user-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { fetchUser } from "@/lib/users/queries";
import {
  canManageRole,
  canManageUsers,
  manageableRoles,
  roleName,
} from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.users.edit.title };
}

async function NoAccess({ message }: { message: string }) {
  const t = await getDictionary();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3 rounded-xl border border-line bg-surface p-5">
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" />
        <div>
          <h1 className="text-sm font-semibold text-ink">
            {t.users.noAccessUserTitle}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{message}</p>
          <Link
            href="/users"
            className="mt-3 flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ArrowLeftIcon className="size-4" />
            {t.common.backToUsers}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function EditUserPage({ params }: PageProps<"/users/[id]">) {
  const actor = await requireUser();
  const t = await getDictionary();

  if (!canManageUsers(actor.role.code)) {
    return <NoAccess message={t.users.noAccessBody(roleName(actor.role.code, t))} />;
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
            userId={user.id}
            roles={roles}
            canChangeRole={!isSelf}
            canChangeStatus={!isSelf}
            defaultValues={{
              fullName: user.fullName,
              userName: user.userName,
              email: user.email,
              roleCode: user.role.code,
              jobTitle: user.jobTitle ?? "",
              isActive: user.isActive,
            }}
          />
        </div>
      </section>
    </div>
  );
}
