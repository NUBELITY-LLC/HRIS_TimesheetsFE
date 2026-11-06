import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PolicyDocument } from "@/components/legal/policy-document";
import { getDictionary } from "@/i18n/server";
import { PRIVACY_POLICY, PRIVACY_POLICY_UPDATED } from "@/lib/legal/privacy-policy";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.privacyPolicy.title };
}

export default async function PrivacyPolicyPage() {
  const t = await getDictionary();
  const copy = t.privacyPolicy;

  return (
    <main id="top" className="min-h-dvh bg-white px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/" className="flex w-fit flex-col items-start">
          <Image
            src="/nubelity-logo.png"
            alt="Nubelity"
            width={800}
            height={452}
            priority
            className="h-auto w-32"
          />
          <span className="mt-1.5 text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">
            Timesheets
          </span>
        </Link>

        <header className="mt-10 border-b border-line pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{copy.title}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{copy.updated(PRIVACY_POLICY_UPDATED)}</p>
          {copy.languageNote ? (
            <p className="mt-3 text-sm text-ink-muted">{copy.languageNote}</p>
          ) : null}
        </header>

        <article lang="en" className="mt-6">
          <PolicyDocument blocks={PRIVACY_POLICY} />
        </article>

        <div className="mt-10 border-t border-line pt-6 text-sm">
          <a href="#top" className="text-ink-muted hover:text-ink-soft">
            {copy.backToTop}
          </a>
        </div>
      </div>
    </main>
  );
}
