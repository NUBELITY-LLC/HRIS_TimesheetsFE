"use client";

import { useEffect, useRef, useState } from "react";

import { PlusIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { COMPANY_FILTER_KEYS } from "@/lib/reports/scope";
import type { CompanyFilterOptions, CompanyFilters } from "@/lib/reports/types";

type FilterKey = (typeof COMPANY_FILTER_KEYS)[number];

export function CompanyExtraFilters({
  options,
  filters,
}: {
  options: CompanyFilterOptions;
  filters: CompanyFilters;
}) {
  const t = useDictionary();
  const c = t.reports.company;
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<FilterKey[]>(() =>
    COMPANY_FILTER_KEYS.filter((key) => filters[key] !== null),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const submitPending = useRef(false);

  const choices: Record<FilterKey, { value: string; label: string }[]> = {
    projectId: options.projects.map((project) => ({
      value: String(project.id),
      label: project.code ? `${project.name} · ${project.code}` : project.name,
    })),
    userId: options.people.map((person) => ({
      value: String(person.id),
      label: person.fullName,
    })),
  };

  const available = COMPANY_FILTER_KEYS.filter(
    (key) => !active.includes(key) && choices[key].length > 0,
  );

  useEffect(() => {
    if (!submitPending.current) return;
    submitPending.current = false;
    rootRef.current?.closest("form")?.requestSubmit();
  }, [active]);

  function add(key: FilterKey) {
    submitPending.current = true;
    setActive((current) => [...current, key]);
    setMenuOpen(false);
  }

  function remove(key: FilterKey) {
    submitPending.current = true;
    setActive((current) => current.filter((item) => item !== key));
  }

  return (
    <div ref={rootRef} className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-ink-soft">
        {c.filtersLabel}
      </span>

      {active.map((key) => (
        <div
          key={key}
          className="flex items-center gap-1 rounded-lg border border-brand-300 bg-brand-50 py-0.5 pr-1 pl-2.5"
        >
          <label
            htmlFor={`filter-${key}`}
            className="text-xs font-medium text-brand-700"
          >
            {c.filters[key]}
          </label>
          <select
            id={`filter-${key}`}
            name={key}
            defaultValue={filters[key] ?? ""}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className="max-w-56 rounded-md border-0 bg-transparent py-1 pr-7 pl-1 text-xs text-ink focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            <option value="">{c.allOption}</option>
            {choices[key].map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => remove(key)}
            aria-label={`${c.removeFilter}: ${c.filters[key]}`}
            className="rounded-md px-1.5 text-sm leading-none text-brand-700 transition-colors hover:bg-brand-100"
          >
            ×
          </button>
        </div>
      ))}

      {available.length > 0 ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-muted"
          >
            <PlusIcon className="size-3.5" />
            {c.addFilter}
          </button>

          {menuOpen ? (
            <ul className="absolute left-0 z-10 mt-1 min-w-40 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-md">
              {available.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => add(key)}
                    className="block w-full px-3 py-1.5 text-left text-xs text-ink transition-colors hover:bg-surface-muted"
                  >
                    {c.filters[key]}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
