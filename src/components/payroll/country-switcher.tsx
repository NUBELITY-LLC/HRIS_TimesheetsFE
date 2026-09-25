"use client";

import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";

import { SpinnerIcon } from "@/components/icons";
import { useDictionary, useLocale } from "@/i18n/provider";
import { countryOptions } from "@/lib/payroll/countries";

export function CountrySwitcher({
  value,
  basePath,
  query = {},
}: {
  value: string;
  basePath: string;
  query?: Record<string, string>;
}) {
  const t = useDictionary();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-xs font-medium text-ink-soft">
        {t.payTerms.country}
      </label>
      <select
        id={id}
        value={value}
        disabled={isPending}
        onChange={(event) => {
          const params = new URLSearchParams({
            ...query,
            country: event.target.value,
          });
          startTransition(() =>
            router.push(`${basePath}?${params.toString()}`),
          );
        }}
        className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none"
      >
        {countryOptions(locale).map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      {isPending ? (
        <SpinnerIcon className="size-4 animate-spin text-ink-muted" />
      ) : null}
    </div>
  );
}
