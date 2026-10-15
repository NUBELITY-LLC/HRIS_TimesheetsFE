import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.forgotPassword.title };
}

export default async function ForgotPasswordPage() {
  const t = await getDictionary();

  return (
    <AuthShell title={t.forgotPassword.title} subtitle={t.forgotPassword.subtitle}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
