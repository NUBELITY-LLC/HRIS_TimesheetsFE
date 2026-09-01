import type { Metadata } from "next";
import Link from "next/link";

import { AlertIcon, ArrowLeftIcon } from "@/components/icons";
import { UserForm } from "@/components/users/user-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { canManageUsers, manageableRoles, roleName } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.users.newUser };
}

export default async function NewUserPage() {
  const actor = await requireUser();
  const t = await getDictionary();

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
              {t.users.create.noAccessBody(roleName(actor.role.code, t))}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          {t.users.create.title}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          {t.users.create.subtitle(
            roleName(actor.role.code, t),
            roles.map((role) => role.name).join(", "),
          )}
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <h2 className="border-b border-line bg-surface-muted px-5 py-3.5 text-sm font-semibold text-ink">
          {t.users.form.section}
        </h2>
        <div className="p-5">
          <UserForm mode="create" roles={roles} />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-ink">
          {t.users.create.rolesSection}
        </h2>
        <dl className="mt-3 space-y-2.5">
          {roles.map((role) => (
            <div key={role.code} className="text-sm">
              <dt className="font-medium text-ink">{role.name}</dt>
              <dd className="text-ink-muted">{role.description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
