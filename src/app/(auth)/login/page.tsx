import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { AlertIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { getDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.login.title };
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const nextPath = firstParam(params.next);
  const reason = firstParam(params.reason);

  const t = await getDictionary();
  const user = await getCurrentUser();
  if (user) redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          {}
          <Image
            src="/nubelity-logo.png"
            alt="Nubelity"
            width={800}
            height={452}
            priority
            className="h-auto w-44"
          />
          <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">
            Timesheets
          </p>
        </div>

        <div className="mt-10">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t.login.title}
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {t.login.subtitle}
          </p>
        </div>

        {reason === "session_expired" ? (
          <div
            role="status"
            className="mt-5 flex gap-3 rounded-lg border border-brand-200 bg-brand-50 p-3.5 text-sm text-brand-700"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            <p>{t.login.sessionExpired}</p>
          </div>
        ) : null}

        <div className="mt-6">
          <LoginForm nextPath={nextPath} />
        </div>

        <p className="mt-8 border-t border-line pt-6 text-center text-sm text-ink-muted">
          {t.login.adminNote}
        </p>
      </div>
    </main>
  );
}
