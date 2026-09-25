"use client";

import { useEffect } from "react";

import { AlertIcon, RefreshIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";

export default function AppSegmentError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      role="alert"
      className="mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center shadow-sm"
    >
      <span
        aria-hidden="true"
        className="mx-auto grid size-12 place-items-center rounded-full bg-danger-50 text-danger-600"
      >
        <AlertIcon className="size-6" />
      </span>

      <h1 className="mt-4 text-base font-semibold text-ink">
        {t.pageError.title}
      </h1>
      <p className="mt-1.5 text-sm text-ink-muted">{t.pageError.body}</p>

      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        <RefreshIcon className="size-4" />
        {t.pageError.retry}
      </button>
    </section>
  );
}
