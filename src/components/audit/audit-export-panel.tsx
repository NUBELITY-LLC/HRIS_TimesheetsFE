"use client";

import { useState } from "react";

import { ChevronDownIcon, DownloadIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import {
  AUDIT_COLUMNS,
  DEFAULT_AUDIT_COLUMNS,
  type AuditColumn,
} from "@/lib/audit/types";

const CHECKBOX_CLASS =
  "size-4 rounded border-line text-brand-600 focus:ring-brand-100";

const PRESET_CLASS =
  "rounded-md px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50";

export function AuditExportPanel({
  hiddenFields,
}: {
  hiddenFields: [string, string][];
}) {
  const t = useDictionary();
  const x = t.audit.export;
  const [columns, setColumns] = useState<AuditColumn[]>(DEFAULT_AUDIT_COLUMNS);

  function toggle(column: AuditColumn, checked: boolean) {
    setColumns((current) =>
      checked
        ? AUDIT_COLUMNS.filter((item) => item === column || current.includes(item))
        : current.filter((item) => item !== column),
    );
  }

  return (
    <details className="group rounded-xl border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <DownloadIcon className="size-4 text-brand-600" />
          {x.title}
        </span>
        <ChevronDownIcon className="size-4 text-ink-muted transition-transform group-open:rotate-180" />
      </summary>

      <form
        action="/audit/export"
        method="get"
        className="space-y-4 border-t border-line px-4 py-4"
      >
        {hiddenFields.map(([name, value], index) => (
          <input key={`${name}-${index}`} type="hidden" name={name} value={value} />
        ))}
        <input type="hidden" name="columns" value={columns.join(",")} />

        <p className="text-sm text-ink-muted">{x.intro}</p>

        <fieldset className="space-y-2" aria-label={x.columns}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-soft">{x.columns}</span>
            <button
              type="button"
              className={PRESET_CLASS}
              onClick={() => setColumns([...AUDIT_COLUMNS])}
            >
              {x.selectAll}
            </button>
            <button
              type="button"
              className={PRESET_CLASS}
              onClick={() => setColumns(DEFAULT_AUDIT_COLUMNS)}
            >
              {x.selectDefault}
            </button>
            <button
              type="button"
              className={PRESET_CLASS}
              onClick={() => setColumns([])}
            >
              {x.selectNone}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIT_COLUMNS.map((column) => (
              <label
                key={column}
                className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft"
              >
                <input
                  type="checkbox"
                  checked={columns.includes(column)}
                  onChange={(event) => toggle(column, event.target.checked)}
                  className={CHECKBOX_CLASS}
                />
                {t.audit.columns[column]}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="changeDetail"
            value="1"
            className={CHECKBOX_CLASS}
          />
          {x.changeDetail}
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!columns.length}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DownloadIcon className="size-4" />
            {x.submit}
          </button>
          <p className="text-xs text-ink-muted">
            {columns.length ? x.limit : x.noColumns}
          </p>
        </div>
      </form>
    </details>
  );
}
