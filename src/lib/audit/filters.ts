import { isISODate, normalizeRange, todayISO } from "@/lib/reports/range";
import { addDays, fromISODate, toISODate } from "@/lib/timesheets/week";
import {
  AUDIT_ACTIONS,
  AUDIT_CATEGORIES,
  AUDIT_COLUMNS,
  AUDIT_SOURCES,
  type AuditAction,
  type AuditCategory,
  type AuditColumn,
  type AuditSource,
} from "./types";

type Params = Record<string, string | string[] | undefined>;

export const AUDIT_PAGE_SIZE = 25;

export const AUDIT_PRESETS = ["today", "week", "month", "quarter"] as const;

export type AuditPreset = (typeof AUDIT_PRESETS)[number];

export type AuditFilters = {
  from: string;
  to: string;
  categories: AuditCategory[];
  actions: AuditAction[];
  sources: AuditSource[];
  actorId: string;
  subjectUserId: string;
  projectId: string;
  timesheet: string;
  search: string;
  sortDir: "asc" | "desc";
  page: number;
};

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function listParam<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T[] {
  const raw = (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((item) => item.split(","))
    .map((item) => item.trim());

  return allowed.filter((item) => raw.includes(item));
}

function idParam(value: string | string[] | undefined): string {
  const id = Number(firstParam(value));
  return Number.isInteger(id) && id > 0 ? String(id) : "";
}

export function auditPresetRange(preset: AuditPreset): {
  from: string;
  to: string;
} {
  const to = todayISO();
  const today = fromISODate(to);
  const back = (days: number) =>
    today ? toISODate(addDays(today, -days)) : to;

  if (preset === "today") return { from: to, to };
  if (preset === "week") return { from: back(6), to };
  if (preset === "month") return { from: back(29), to };
  return { from: back(89), to };
}

export function parseAuditFilters(params: Params): AuditFilters {
  const fallback = auditPresetRange("month");
  const from = firstParam(params.from);
  const to = firstParam(params.to);
  const range = normalizeRange(
    isISODate(from) ? from : fallback.from,
    isISODate(to) ? to : fallback.to,
  );
  const page = Number(firstParam(params.page));

  return {
    ...range,
    categories: listParam(params.category, AUDIT_CATEGORIES),
    actions: listParam(params.action, AUDIT_ACTIONS),
    sources: listParam(params.source, AUDIT_SOURCES),
    actorId: idParam(params.actorId),
    subjectUserId: idParam(params.subjectUserId),
    projectId: idParam(params.projectId),
    timesheet: firstParam(params.timesheet).trim().slice(0, 30),
    search: firstParam(params.search).trim().slice(0, 100),
    sortDir: firstParam(params.sortDir) === "asc" ? "asc" : "desc",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function parseAuditColumns(
  value: string | string[] | undefined,
): AuditColumn[] {
  return listParam(value, AUDIT_COLUMNS);
}

export function auditSearchParams(
  filters: AuditFilters,
  overrides: Partial<AuditFilters> = {},
): URLSearchParams {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams({ from: merged.from, to: merged.to });

  for (const category of merged.categories) params.append("category", category);
  for (const action of merged.actions) params.append("action", action);
  for (const source of merged.sources) params.append("source", source);
  if (merged.actorId) params.set("actorId", merged.actorId);
  if (merged.subjectUserId) params.set("subjectUserId", merged.subjectUserId);
  if (merged.projectId) params.set("projectId", merged.projectId);
  if (merged.timesheet) params.set("timesheet", merged.timesheet);
  if (merged.search) params.set("search", merged.search);
  if (merged.sortDir !== "desc") params.set("sortDir", merged.sortDir);
  if (merged.page > 1) params.set("page", String(merged.page));

  return params;
}

export function auditApiParams(filters: AuditFilters): URLSearchParams {
  const params = new URLSearchParams({
    from: filters.from,
    to: filters.to,
    sortDir: filters.sortDir,
  });

  if (filters.categories.length) params.set("categories", filters.categories.join(","));
  if (filters.actions.length) params.set("actions", filters.actions.join(","));
  if (filters.sources.length) params.set("sources", filters.sources.join(","));
  if (filters.actorId) params.set("actorId", filters.actorId);
  if (filters.subjectUserId) params.set("subjectUserId", filters.subjectUserId);
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.timesheet) params.set("timesheet", filters.timesheet);
  if (filters.search) params.set("search", filters.search);

  return params;
}

export function auditHref(
  filters: AuditFilters,
  overrides: Partial<AuditFilters> = {},
): string {
  const query = auditSearchParams(filters, overrides).toString();
  return query ? `/audit?${query}` : "/audit";
}
