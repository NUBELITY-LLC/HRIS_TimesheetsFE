"use client";

import { useActionState } from "react";

import { CheckIcon, SpinnerIcon } from "@/components/icons";
import { LOCALE_LABELS, LOCALES } from "@/i18n/config";
import { setLocaleAction } from "@/i18n/actions";
import { useDictionary, useLocale } from "@/i18n/provider";

export function LanguageForm() {
  const t = useDictionary();
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(setLocaleAction, {
    status: "idle" as const,
  });

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="locale" className="block text-sm font-medium text-ink-soft">
          {t.settings.languageLabel}
        </label>
        <select
          id="locale"
          name="locale"
          defaultValue={locale}
          disabled={isPending}
          className="w-full max-w-xs rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted"
        >
          {LOCALES.map((value) => (
            <option key={value} value={value}>
              {LOCALE_LABELS[value]}
            </option>
          ))}
        </select>
        <p className="text-xs text-ink-muted">{t.settings.languageHint}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-600/60"
        >
          {isPending ? (
            <>
              <SpinnerIcon className="size-4 animate-spin" />
              {t.settings.saving}
            </>
          ) : (
            t.settings.save
          )}
        </button>

        {state.status === "success" && !isPending ? (
          <span
            role="status"
            className="flex items-center gap-1.5 text-sm text-success-700"
          >
            <CheckIcon className="size-4" />
            {t.settings.saved}
          </span>
        ) : null}
      </div>
    </form>
  );
}
