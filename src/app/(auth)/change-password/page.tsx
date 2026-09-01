import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { ArrowLeftIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.changePassword.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function ChangePasswordPage({
  searchParams,
}: PageProps<"/change-password">) {
  const user = await requireUser();
  const t = await getDictionary();
  const params = await searchParams;
  const nextParam = firstParam(params.next);
  const forced = user.mustChangePassword;
  const nextPath = nextParam.startsWith("/")
    ? nextParam
    : forced
      ? "/dashboard"
      : "/settings";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/nubelity-logo.png"
            alt="Nubelity"
            width={800}
            height={452}
            priority
            className="h-auto w-40"
          />
        </div>

        <div className="mt-10">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t.changePassword.title}
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {forced
              ? t.changePassword.subtitle(user.fullName)
              : t.changePassword.voluntarySubtitle}
          </p>
        </div>

        <div className="mt-6">
          <ChangePasswordForm nextPath={nextPath} forced={forced} />
        </div>

        {forced ? null : (
          <Link
            href="/settings"
            className="mt-6 flex w-fit items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink-soft"
          >
            <ArrowLeftIcon className="size-4" />
            {t.changePassword.backToSettings}
          </Link>
        )}
      </div>
    </main>
  );
}
