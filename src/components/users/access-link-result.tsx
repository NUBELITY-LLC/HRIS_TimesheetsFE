"use client";

import { useId, useRef, useState } from "react";

import { AlertIcon, CheckIcon, CopyIcon } from "@/components/icons";
import type { AccountLinkResult } from "@/lib/api/types";
import { formatDateTimeLong } from "@/lib/format/datetime";
import { useDictionary, useLocale } from "@/i18n/provider";

export function AccessLinkResult({
  result,
  email,
}: {
  result: AccountLinkResult;
  email: string;
}) {
  const t = useDictionary();
  const locale = useLocale();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<"copied" | "copyFailed" | null>(null);
  const expires = formatDateTimeLong(result.expiresAt, locale, { empty: "", invalid: "" });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.link);
      setNotice("copied");
    } catch {
      inputRef.current?.select();
      setNotice("copyFailed");
    }
  }

  return (
    <div className="space-y-3">
      <div
        role="status"
        aria-live="polite"
        className={`flex gap-3 rounded-lg border p-3.5 text-sm ${
          result.emailSent
            ? "border-success-200 bg-success-50 text-success-800"
            : "border-warn-200 bg-warn-50 text-warn-700"
        }`}
      >
        {result.emailSent ? (
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
        ) : (
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
        )}
        <p>{result.emailSent ? t.users.access.sentByEmail(email) : t.users.access.notSent}</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-soft">
          {t.users.access.linkLabel}
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            readOnly
            value={result.link}
            onFocus={(event) => event.currentTarget.select()}
            className="min-w-0 flex-1 rounded-lg border border-line bg-surface-muted px-3 py-2.5 font-mono text-xs text-ink-soft focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3.5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
          >
            <CopyIcon className="size-4" />
            {t.users.access.copy}
          </button>
        </div>
        {notice ? (
          <p
            role="status"
            className={`text-xs ${notice === "copied" ? "text-success-700" : "text-danger-600"}`}
          >
            {notice === "copied" ? t.users.access.copied : t.users.access.copyFailed}
          </p>
        ) : expires ? (
          <p className="text-xs text-ink-muted">{t.users.access.linkExpires(expires)}</p>
        ) : null}
      </div>
    </div>
  );
}
