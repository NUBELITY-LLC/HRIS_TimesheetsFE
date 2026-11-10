import type { Metadata } from "next";

import { NoInboxAccess } from "@/components/feedback/no-inbox-access";
import { SubmitFeedbackForm } from "@/components/feedback/submit-feedback-form";
import { TrackFeedbackForm } from "@/components/feedback/track-feedback-form";
import { getDictionary } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { canSubmitFeedback } from "@/lib/users/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.feedback.title };
}

export default async function FeedbackPage() {
  const [t, user] = await Promise.all([getDictionary(), requireUser()]);

  if (!canSubmitFeedback(user)) {
    return <NoInboxAccess t={t} body={t.feedback.noAccessBody} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t.feedback.title}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">{t.feedback.intro}</p>
      </header>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">{t.feedback.form.title}</h2>
        <SubmitFeedbackForm />
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-ink">{t.feedback.tracking.title}</h2>
        <TrackFeedbackForm />
      </section>
    </div>
  );
}
