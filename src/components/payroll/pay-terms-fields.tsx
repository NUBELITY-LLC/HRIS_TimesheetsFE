"use client";

import { useId, useState } from "react";

import { useDictionary, useLocale } from "@/i18n/provider";
import { countryOptions } from "@/lib/payroll/countries";
import {
  CONTRACT_TYPES,
  DEFAULT_PAY_TERMS,
  type ContractType,
  type PayTerms,
} from "@/lib/payroll/pay-terms";

const INPUT_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted disabled:text-ink-muted";

const LABEL_CLASS = "block text-xs font-medium text-ink-soft";

function Fields({
  defaults,
  disabled,
}: {
  defaults: PayTerms;
  disabled: boolean;
}) {
  const t = useDictionary();
  const locale = useLocale();
  const [contractType, setContractType] = useState<ContractType>(
    defaults.contractType,
  );
  const ids = {
    contractType: useId(),
    countryCode: useId(),
    hoursDivisor: useId(),
    dailyHours: useId(),
    overtimeMultiplier: useId(),
    holidayMultiplier: useId(),
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor={ids.contractType} className={LABEL_CLASS}>
            {t.payTerms.contractType}
          </label>
          <select
            id={ids.contractType}
            name="contractType"
            value={contractType}
            onChange={(event) =>
              setContractType(event.target.value as ContractType)
            }
            disabled={disabled}
            className={INPUT_CLASS}
          >
            {CONTRACT_TYPES.map((code) => (
              <option key={code} value={code}>
                {t.payTerms.contractTypes[code]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor={ids.countryCode} className={LABEL_CLASS}>
            {t.payTerms.country}
          </label>
          <select
            id={ids.countryCode}
            name="countryCode"
            defaultValue={defaults.countryCode}
            disabled={disabled}
            className={INPUT_CLASS}
          >
            {countryOptions(locale).map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor={ids.hoursDivisor} className={LABEL_CLASS}>
            {t.payTerms.hoursDivisor}
          </label>
          <input
            id={ids.hoursDivisor}
            name="hoursDivisor"
            type="text"
            inputMode="decimal"
            maxLength={7}
            defaultValue={defaults.hoursDivisor}
            disabled={disabled}
            className={`tabular-nums ${INPUT_CLASS}`}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={ids.dailyHours} className={LABEL_CLASS}>
            {t.payTerms.dailyHours}
          </label>
          <input
            id={ids.dailyHours}
            name="dailyHours"
            type="text"
            inputMode="decimal"
            maxLength={5}
            defaultValue={defaults.dailyHours}
            disabled={disabled}
            className={`tabular-nums ${INPUT_CLASS}`}
          />
        </div>
      </div>

      {contractType === "CONTRACTOR" ? (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <label htmlFor={ids.overtimeMultiplier} className={LABEL_CLASS}>
              {t.payTerms.overtimeMultiplier}
            </label>
            <input
              id={ids.overtimeMultiplier}
              name="overtimeMultiplier"
              type="text"
              inputMode="decimal"
              maxLength={5}
              defaultValue={defaults.overtimeMultiplier}
              disabled={disabled}
              className={`tabular-nums ${INPUT_CLASS}`}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor={ids.holidayMultiplier} className={LABEL_CLASS}>
              {t.payTerms.holidayMultiplier}
            </label>
            <input
              id={ids.holidayMultiplier}
              name="holidayMultiplier"
              type="text"
              inputMode="decimal"
              maxLength={5}
              defaultValue={defaults.holidayMultiplier}
              disabled={disabled}
              className={`tabular-nums ${INPUT_CLASS}`}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-muted">{t.payTerms.payrollRules}</p>
      )}
    </div>
  );
}

export function PayTermsFields({
  defaults = DEFAULT_PAY_TERMS,
  disabled = false,
  error,
  collapsible = false,
}: {
  defaults?: PayTerms;
  disabled?: boolean;
  error?: string;
  collapsible?: boolean;
}) {
  const t = useDictionary();

  if (collapsible) {
    return (
      <details className="group rounded-lg border border-line px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-ink-soft select-none">
          {t.payTerms.section} ·{" "}
          {t.payTerms.summary(
            t.payTerms.contractTypes[defaults.contractType],
            defaults.hoursDivisor,
          )}
        </summary>
        <div className="pt-3 pb-1">
          <Fields defaults={defaults} disabled={disabled} />
        </div>
        {error ? <p className="pb-1 text-xs text-danger-600">{error}</p> : null}
      </details>
    );
  }

  return (
    <fieldset className="space-y-3 rounded-lg border border-line p-4">
      <legend className="px-1 text-sm font-semibold text-ink">
        {t.payTerms.section}
      </legend>
      <Fields defaults={defaults} disabled={disabled} />
      {error ? <p className="text-xs text-danger-600">{error}</p> : null}
    </fieldset>
  );
}
