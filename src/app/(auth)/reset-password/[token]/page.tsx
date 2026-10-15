import type { Metadata } from "next";

import { AccountLinkPage } from "@/components/auth/account-link-page";
import { getDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.accountLink.reset.title, referrer: "no-referrer" };
}

export default async function ResetPasswordPage({
  params,
}: PageProps<"/reset-password/[token]">) {
  const { token } = await params;
  return <AccountLinkPage purpose="RESET" token={token} />;
}
