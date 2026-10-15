"use client";

import { useId, useState } from "react";

import { CheckIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { PASSWORD_RULES, passwordRuleLabel } from "@/lib/auth/password-policy";

type PasswordFieldProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  autoComplete?: string;
  showChecklist?: boolean;
};

export function PasswordField({
  name,
  label,
  error,
  hint,
  disabled = false,
  autoComplete = "new-password",
  showChecklist = false,
}: PasswordFieldProps) {
  const t = useDictionary();
  const inputId = useId();
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);

  const borderClass = error
    ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
    : "border-line";

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink-soft">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          maxLength={200}
          disabled={disabled}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-11 text-sm text-ink transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted ${borderClass}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? t.password.hide : t.password.show}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-soft"
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>

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
