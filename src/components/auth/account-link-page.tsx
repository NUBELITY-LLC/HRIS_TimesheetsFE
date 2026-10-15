import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { AlertIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/server";
import { fetchAccountLink } from "@/lib/auth/account-link-queries";
import type { AccountLinkPurpose } from "@/lib/auth/account-link-state";
import { formatDateTimeLong } from "@/lib/format/datetime";

export async function AccountLinkPage({
  purpose,
  token,
}: {
  purpose: AccountLinkPurpose;
  token: string;
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const copy = purpose === "INVITE" ? t.accountLink.invite : t.accountLink.reset;
  const lookup = await fetchAccountLink(purpose, token);

  if (lookup.status !== "valid") {
    const unavailable = lookup.status === "unavailable";

    return (
      <AuthShell title={unavailable ? copy.title : copy.invalidTitle}>
        <div className="space-y-6">
          <div
            role="alert"
            className="flex gap-3 rounded-lg border border-line bg-surface-muted p-3.5 text-sm text-ink-soft"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0 text-ink-muted" />
            <p>{unavailable ? t.accountLink.errors.NETWORK_ERROR : copy.invalidBody}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {purpose === "RESET" && !unavailable ? (
              <Link
                href="/forgot-password"
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                {t.accountLink.reset.requestNew}
              </Link>
            ) : null}
            <Link href="/login" className="text-ink-muted hover:text-ink-soft">
              {t.accountLink.backToLogin}
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  const { link } = lookup;
  const expires = formatDateTimeLong(link.expiresAt, locale, { empty: "", invalid: "" });

  return (
    <AuthShell title={copy.title} subtitle={copy.subtitle(link.fullName)}>
      <div className="space-y-5">
        <dl className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg border border-line bg-surface-muted px-3.5 py-3 text-sm">
          <div className="flex gap-2">
            <dt className="text-ink-muted">{t.accountLink.userLabel}</dt>
            <dd className="font-medium text-ink">{link.userName}</dd>
          </div>
          <div className="min-w-0 truncate text-ink-muted">{link.email}</div>
        </dl>

        <SetPasswordForm purpose={purpose} token={token} userName={link.userName} />

        {expires ? (
          <p className="text-xs text-ink-muted">{t.accountLink.expires(expires)}</p>
        ) : null}
      </div>
    </AuthShell>
  );
}
