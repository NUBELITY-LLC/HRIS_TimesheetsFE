"use client";

import { useId, useState } from "react";

import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshIcon,
} from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import {
  PASSWORD_RULES,
  generatePassword,
  passwordRuleLabel,
} from "@/lib/auth/password-policy";

type PasswordFieldProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  autoComplete?: string;
  showGenerator?: boolean;
  showChecklist?: boolean;
};

type Notice = "generated" | "generatedNoCopy" | "copied" | "copyFailed" | null;

export function PasswordField({
  name,
  label,
  error,
  hint,
  disabled = false,
  autoComplete = "new-password",
  showGenerator = false,
  showChecklist = false,
}: PasswordFieldProps) {
  const t = useDictionary();
  const inputId = useId();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const borderClass = error
    ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
    : "border-line";

  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  async function handleGenerate() {
    const generated = generatePassword();
    setValue(generated);
    setVisible(true);
    setNotice((await copyToClipboard(generated)) ? "generated" : "generatedNoCopy");
  }

  async function handleCopy() {
    if (!value) return;
    setNotice((await copyToClipboard(value)) ? "copied" : "copyFailed");
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-soft">
          {label}
        </label>
        {showGenerator ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={disabled}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:text-ink-muted"
          >
            <RefreshIcon className="size-3.5" />
            {t.password.generate}
          </button>
        ) : null}
      </div>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          maxLength={200}
          disabled={disabled}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setNotice(null);
          }}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted ${borderClass} ${
            showGenerator ? "pr-19" : "pr-11"
          }`}
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5">
          {showGenerator ? (
            <button
              type="button"
              onClick={handleCopy}
              disabled={disabled || !value}
              aria-label={t.password.copy}
              title={t.password.copy}
              className="grid size-7 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-soft disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <CopyIcon className="size-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? t.password.hide : t.password.show}
            aria-pressed={visible}
            className="grid size-7 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-soft"
          >
            {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className={`text-xs ${
            notice === "copyFailed" ? "text-danger-600" : "text-success-700"
          }`}
        >
          {t.password[notice]}
        </p>
      ) : null}

      {error ? (
        <p className="text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}

      {showChecklist ? (
        <ul className="grid gap-1 pt-1 sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(value);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-1.5 text-xs ${
                  met ? "text-success-700" : "text-ink-muted"
                }`}
              >
                <CheckIcon
                  className={`size-3.5 ${met ? "opacity-100" : "opacity-40"}`}
                />
                {passwordRuleLabel(rule.id, t)}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
