import Link from "next/link";

import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import { getDictionary } from "@/i18n/server";
import {
  AUDIT_PRESETS,
  auditHref,
  auditPresetRange,
  type AuditFilters,
} from "@/lib/audit/filters";
import { actionLabel, categoryLabel, sourceLabel } from "@/lib/audit/format";
import {
  AUDIT_ACTION_GROUPS,
  AUDIT_CATEGORIES,
  AUDIT_SOURCES,
  type AuditActionGroup,
  type AuditOptions,
} from "@/lib/audit/types";

const FIELD_CLASS =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";

const LABEL_CLASS = "block text-xs font-medium text-ink-soft";

const CHECKBOX_CLASS =
  "size-4 rounded border-line text-brand-600 focus:ring-brand-100";

export async function AuditFiltersForm({
  filters,
  options,
}: {
  filters: AuditFilters;
  options: AuditOptions;
}) {
  const t = await getDictionary();
  const f = t.audit.filters;
  const actionGroups = Object.keys(AUDIT_ACTION_GROUPS) as AuditActionGroup[];
  const people = options.actors.map((actor) => ({
    id: String(actor.id),
    label: actor.isActive ? actor.fullName : `${actor.fullName} (${f.inactive})`,
  }));

  return (
    <form
      key={auditHref(filters)}
      action="/audit"
      method="get"
      aria-label={f.label}
      className="space-y-4 rounded-xl border border-line bg-surface p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="from" className={LABEL_CLASS}>
            {f.from}
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={filters.from}
            className={FIELD_CLASS}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="to" className={LABEL_CLASS}>
            {f.to}
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={filters.to}
            className={FIELD_CLASS}
          />
        </div>

        <nav
          className="flex flex-wrap items-center gap-2 pb-0.5"
          aria-label={f.presetsLabel}
        >
          {AUDIT_PRESETS.map((preset) => {
            const range = auditPresetRange(preset);
            const active =
              range.from === filters.from && range.to === filters.to;

            return (
              <Link
                key={preset}
                href={auditHref(filters, { ...range, page: 1 })}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-line bg-surface text-ink-soft hover:bg-surface-muted"
                }`}
              >
                {f.presets[preset]}
              </Link>
            );
          })}
        </nav>
      </div>

      <fieldset className="space-y-2">
        <legend className={LABEL_CLASS}>{f.categories}</legend>
        <div className="flex flex-wrap gap-2">
          {AUDIT_CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft has-checked:border-brand-300 has-checked:bg-brand-50 has-checked:text-brand-700"
            >
              <input
                type="checkbox"
                name="category"
                value={category}
                defaultChecked={filters.categories.includes(category)}
                className={CHECKBOX_CLASS}
              />
              {categoryLabel(category, t)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <span className={LABEL_CLASS}>{f.actions}</span>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink">
              <span className="truncate">
                {filters.actions.length
                  ? f.actionsSelected(filters.actions.length)
                  : f.actionsAll}
              </span>
              <ChevronDownIcon className="size-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute z-20 mt-1 max-h-80 w-80 max-w-[90vw] space-y-3 overflow-y-auto rounded-lg border border-line bg-white p-3 shadow-lg">
              {actionGroups.map((group) => (
                <fieldset key={group} className="space-y-1.5">
                  <legend className="text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
                    {f.actionGroups[group]}
                  </legend>
                  {AUDIT_ACTION_GROUPS[group].map((action) => (
                    <label
                      key={action}
                      className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft"
                    >
                      <input
                        type="checkbox"
                        name="action"
                        value={action}
                        defaultChecked={filters.actions.includes(action)}
                        className={CHECKBOX_CLASS}
                      />
                      {actionLabel(action, t)}
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </details>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="actorId" className={LABEL_CLASS}>
            {f.actor}
          </label>
          <select
            id="actorId"
            name="actorId"
            defaultValue={filters.actorId}
            className={FIELD_CLASS}
          >
            <option value="">{f.anyone}</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="subjectUserId" className={LABEL_CLASS}>
            {f.subject}
          </label>
          <select
            id="subjectUserId"
            name="subjectUserId"
            defaultValue={filters.subjectUserId}
            className={FIELD_CLASS}
          >
            <option value="">{f.anyone}</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="projectId" className={LABEL_CLASS}>
            {f.project}
          </label>
          <select
            id="projectId"
            name="projectId"
            defaultValue={filters.projectId}
            className={FIELD_CLASS}
          >
            <option value="">{f.anyProject}</option>
            {options.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.code ? `${project.name} · ${project.code}` : project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="source" className={LABEL_CLASS}>
            {f.source}
          </label>
          <select
            id="source"
            name="source"
            defaultValue={filters.sources[0] ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">{f.anySource}</option>
            {AUDIT_SOURCES.map((source) => (
              <option key={source} value={source}>
                {sourceLabel(source, t)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="timesheet" className={LABEL_CLASS}>
            {f.timesheet}
          </label>
          <input
            id="timesheet"
            name="timesheet"
            type="search"
            maxLength={30}
            defaultValue={filters.timesheet}
            placeholder={f.timesheetPlaceholder}
            className={`${FIELD_CLASS} placeholder:text-ink-muted/70`}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="search" className={LABEL_CLASS}>
            {f.search}
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="search"
              name="search"
              type="search"
              maxLength={100}
              defaultValue={filters.search}
              placeholder={f.searchPlaceholder}
              className={`${FIELD_CLASS} pl-9 placeholder:text-ink-muted/70`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sortDir" className={LABEL_CLASS}>
            {f.order}
          </label>
          <select
            id="sortDir"
            name="sortDir"
            defaultValue={filters.sortDir}
            className={FIELD_CLASS}
          >
            <option value="desc">{f.newest}</option>
            <option value="asc">{f.oldest}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t.common.apply}
        </button>
        <Link
          href="/audit"
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
        >
          {f.clear}
        </Link>
      </div>
    </form>
  );
}
