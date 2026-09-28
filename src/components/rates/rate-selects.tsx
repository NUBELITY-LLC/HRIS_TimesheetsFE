"use client";

import { useDictionary, useLocale } from "@/i18n/provider";
import {
  CURRENCY_CODES,
  DEFAULT_CURRENCY,
  DEFAULT_RATE_PERIOD,
  RATE_PERIODS,
  currencyName,
} from "@/lib/rates/rates";
import {
  CONTRACT_TYPES,
  DEFAULT_PAY_TERMS,
} from "@/lib/payroll/pay-terms";

type SelectProps = {
  id?: string;
  name?: string;
  defaultValue?: string;
  disabled?: boolean;
  className: string;
};

type CurrencySelectProps = SelectProps & { compact?: boolean };

export function CurrencySelect({
  id,
  name = "currency",
  defaultValue = DEFAULT_CURRENCY,
  disabled,
  className,
  compact = false,
}: CurrencySelectProps) {
  const t = useDictionary();
  const locale = useLocale();

  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      disabled={disabled}
      aria-label={t.rates.currency}
      className={className}
    >
      {CURRENCY_CODES.map((code) => (
        <option key={code} value={code} title={currencyName(code, locale)}>
          {compact ? code : `${code} · ${currencyName(code, locale)}`}
        </option>
      ))}
    </select>
  );
}

export function RatePeriodSelect({
  id,
  name = "ratePeriod",
  defaultValue = DEFAULT_RATE_PERIOD,
  disabled,
  className,
}: SelectProps) {
  const t = useDictionary();

  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      disabled={disabled}
      aria-label={t.rates.period}
      className={className}
    >
      {RATE_PERIODS.map((period) => (
        <option key={period} value={period}>
          {t.rates.periods[period]}
        </option>
      ))}
    </select>
  );
}

export function ContractTypeSelect({
  id,
  name = "contractType",
  defaultValue = DEFAULT_PAY_TERMS.contractType,
  disabled,
  className,
}: SelectProps) {
  const t = useDictionary();

  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      disabled={disabled}
      aria-label={t.payTerms.contractType}
      className={className}
    >
      {CONTRACT_TYPES.map((type) => (
        <option key={type} value={type}>
          {t.payTerms.contractTypes[type]}
        </option>
      ))}
    </select>
  );
}
