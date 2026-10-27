import Link from "next/link";

import { getDictionary, getLocale } from "@/i18n/server";
import { auditHref, type AuditFilters } from "@/lib/audit/filters";
import {
  actionLabel,
  actionTone,
  actorName,
  categoryLabel,
  entityLabel,
  fieldLabel,
  formatAuditValue,
  sourceLabel,
  statusLabel,
  weekLabel,
  type AuditTone,
} from "@/lib/audit/format";
import type { AuditEntry } from "@/lib/audit/types";
import { formatDateTime, formatDateTimeLong } from "@/lib/format/datetime";
import { roleName } from "@/lib/users/roles";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

const TONE_CLASS: Record<AuditTone, string> = {
  success: "bg-success-50 text-success-700",
  danger: "bg-danger-50 text-danger-700",
  warn: "bg-warn-50 text-warn-700",
  neutral: "bg-brand-50 text-brand-700",
};

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function detailItems(
  entry: AuditEntry,
  t: Dictionary,
  locale: Locale,
): [string, string][] {
  const e = t.audit.entry;
  const meta = entry.metadata;
  const items: [string, string][] = [];

  const week = weekLabel(entry, locale);
  if (week) items.push([e.week, week]);

  const hours = numberValue(meta.totalHours);
  if (hours !== null) {
    items.push([
      e.hours,
      new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", {
        maximumFractionDigits: 2,
      }).format(hours),
    ]);
  }

  const fromSeq = numberValue(meta.fromSeq);
  const toSeq = numberValue(meta.toSeq);
  const seq = numberValue(meta.seq);
  if (fromSeq !== null && toSeq !== null && fromSeq !== toSeq) {
    items.push([e.stage, e.steps(fromSeq, toSeq)]);
  } else if (seq !== null || toSeq !== null) {
    items.push([e.stage, e.step((seq ?? toSeq)!)]);
  }

  const cycle = numberValue(meta.cycleNo);
  if (cycle !== null && cycle > 1) items.push([e.round, String(cycle)]);

  const pairs: [string, unknown][] = [
    [e.onBehalfOf, meta.onBehalfOf],
    [e.notice, meta.title],
    [e.recipient, meta.recipientEmail],
    [e.file, meta.fileName],
    [e.reason, meta.error],
  ];
  for (const [label, value] of pairs) {
    const text = textValue(value);
    if (text) items.push([label, text]);
  }

  const attempts = numberValue(meta.attempts);
  if (attempts !== null && attempts > 0) items.push([e.attempts, String(attempts)]);

  const amount = numberValue(meta.amount);
  if (amount !== null && typeof meta.currency === "string") {
    items.push([
      e.amount,
      new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", {
        style: "currency",
        currency: meta.currency,
      }).format(amount),
    ]);
  }

  const lockedUntil = textValue(meta.lockedUntil);
  if (lockedUntil) {
    items.push([
      e.lockedUntil,
      formatDateTime(lockedUntil, locale, { empty: "", invalid: lockedUntil }),
    ]);
  }

  const expiresAt = textValue(meta.expiresAt);
  if (expiresAt && entry.category !== "WORKFLOW") {
    items.push([
      e.validUntil,
      formatDateTime(expiresAt, locale, { empty: "", invalid: expiresAt }),
    ]);
  }

  return items;
}

function originItems(entry: AuditEntry, t: Dictionary): [string, string][] {
  const e = t.audit.entry;
  const items: [string, string][] = [];
  if (entry.ipAddress) items.push([e.ip, entry.ipAddress]);
  if (entry.userAgent) items.push([e.browser, entry.userAgent]);
  if (entry.requestId) items.push([e.operation, entry.requestId]);
  return items;
}

function DefinitionList({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
      {items.map(([label, value], index) => (
        <div key={`${label}-${index}`} className="contents">
          <dt className="font-medium text-ink-soft">{label}</dt>
          <dd className="break-words text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export async function AuditTable({
  entries,
  filters,
}: {
  entries: AuditEntry[];
  filters: AuditFilters;
}) {
  const t = await getDictionary();
  const locale = await getLocale();
  const a = t.audit;
  const fallbacks = { empty: t.common.none, invalid: t.common.unknown };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-5xl border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-muted text-left">
              <th className="px-4 py-3 font-semibold text-ink">{a.table.when}</th>
              <th className="px-4 py-3 font-semibold text-ink">{a.table.action}</th>
              <th className="px-4 py-3 font-semibold text-ink">{a.table.record}</th>
              <th className="px-4 py-3 font-semibold text-ink">{a.table.context}</th>
              <th className="px-4 py-3 font-semibold text-ink">{a.table.actor}</th>
              <th className="px-4 py-3 font-semibold text-ink">{a.table.detail}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((entry) => {
              const changes = Object.entries(entry.changes);
              const details = detailItems(entry, t, locale);
              const origin = originItems(entry, t);
              const hasMore = changes.length > 0 || details.length > 0 || origin.length > 0;
              const transition =
                entry.fromStatus && entry.toStatus && entry.fromStatus !== entry.toStatus
                  ? `${statusLabel(entry.fromStatus, t)} → ${statusLabel(entry.toStatus, t)}`
                  : entry.toStatus && !entry.fromStatus
                    ? statusLabel(entry.toStatus, t)
                    : null;

              return (
                <tr key={entry.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                    <time
                      dateTime={entry.occurredAt}
                      title={formatDateTimeLong(entry.occurredAt, locale, fallbacks)}
                    >
                      {formatDateTime(entry.occurredAt, locale, fallbacks)}
                    </time>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASS[actionTone(entry.action)]}`}
                    >
                      {actionLabel(entry.action, t)}
                    </span>
                    <span className="mt-1 block text-xs text-ink-muted">
                      {categoryLabel(entry.category, t)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-xs font-medium tracking-wide text-ink-muted uppercase">
                      {entityLabel(entry.entityType, t)}
                    </span>
                    {entry.timesheet ? (
                      <Link
                        href={auditHref(filters, {
                          timesheet: entry.timesheet.code ?? String(entry.timesheet.id),
                          page: 1,
                        })}
                        title={a.entry.timesheetTrail}
                        className="font-medium text-brand-600 hover:text-brand-700"
                      >
                        {entry.timesheet.code ?? `#${entry.timesheet.id}`}
                      </Link>
                    ) : null}
                    {entry.entityLabel && entry.entityType !== "TIMESHEET" ? (
                      <span className="block break-words text-ink">{entry.entityLabel}</span>
                    ) : entry.entityLabel && entry.timesheet ? (
                      <span className="block break-words text-ink-soft">
                        {entry.entityLabel}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {entry.subject ? (
                      <span className="block text-ink">{entry.subject.name}</span>
                    ) : null}
                    {entry.project ? (
                      <span className="block text-ink-muted">{entry.project.name}</span>
                    ) : null}
                    {!entry.subject && !entry.project ? (
                      <span className="text-ink-muted">{t.common.none}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-ink">{actorName(entry, t)}</span>
                    <span className="block text-xs text-ink-muted">
                      {entry.actor?.roleCode
                        ? roleName(entry.actor.roleCode, t)
                        : sourceLabel(entry.source, t)}
                    </span>
                  </td>
                  <td className="max-w-md px-4 py-3">
                    {transition ? (
                      <span className="block text-ink-soft">{transition}</span>
                    ) : null}
                    {entry.comments ? (
                      <p className="mt-0.5 rounded-md bg-surface-muted px-2 py-1 text-ink whitespace-pre-line">
                        “{entry.comments}”
                      </p>
                    ) : null}
                    {hasMore ? (
                      <details className="mt-1 group">
                        <summary className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700">
                          {a.entry.viewDetails}
                        </summary>
                        <div className="mt-2 space-y-3 rounded-lg border border-line bg-surface-muted p-3">
                          {changes.length ? (
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
                                {a.entry.changesTitle}
                              </p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-left text-ink-muted">
                                    <th className="pr-3 pb-1 font-medium" />
                                    <th className="pr-3 pb-1 font-medium">{a.entry.before}</th>
                                    <th className="pb-1 font-medium">{a.entry.after}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {changes.map(([field, change]) => (
                                    <tr key={field} className="align-top">
                                      <th className="pr-3 py-0.5 text-left font-medium text-ink-soft">
                                        {fieldLabel(field, t)}
                                      </th>
                                      <td className="pr-3 py-0.5 break-words text-ink-muted">
                                        {formatAuditValue(field, change.from, t, locale)}
                                      </td>
                                      <td className="py-0.5 break-words text-ink">
                                        {formatAuditValue(field, change.to, t, locale)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : null}
                          {details.length ? (
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
                                {a.entry.detailsTitle}
                              </p>
                              <DefinitionList items={details} />
                            </div>
                          ) : null}
                          {origin.length ? (
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
                                {a.entry.originTitle}
                              </p>
                              <DefinitionList items={origin} />
                            </div>
                          ) : null}
                        </div>
                      </details>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
