import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDayAndMonth, fromISODate } from "@/lib/timesheets/week";
import { PROJECT_STATUS_CLOSED, type ProjectStatus } from "./types";

export type ProjectLifecycle = {
  status: ProjectStatus;
  endDate: string | null;
  closedAt?: string | null;
};

export function isProjectClosed(project: ProjectLifecycle): boolean {
  return project.status === PROJECT_STATUS_CLOSED;
}

export function formatProjectDate(
  value: string | null,
  locale: Locale,
  fallback: string,
): string {
  const date = value ? fromISODate(value) : null;
  return date ? formatDayAndMonth(date, locale) : fallback;
}

export function projectLifecycleLabel(
  project: ProjectLifecycle,
  locale: Locale,
  t: Dictionary,
): string {
  const endDate = formatProjectDate(project.endDate, locale, t.common.none);

  if (isProjectClosed(project)) return t.catalog.lifecycle.closedOn(endDate);
  if (!project.endDate) return t.catalog.lifecycle.openEnded;

  return t.catalog.lifecycle.endsOn(endDate);
}
