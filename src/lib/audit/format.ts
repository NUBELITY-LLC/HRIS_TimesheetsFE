import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDateTime, intlLocale } from "@/lib/format/datetime";
import { roleName } from "@/lib/users/roles";
import type { AuditEntry } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export type AuditTone = "success" | "danger" | "warn" | "neutral";

const TONES: Record<string, AuditTone> = {
  CREATED: "success",
  APPROVED: "success",
  CLIENT_APPROVED: "success",
  ACTIVATED: "success",
  REOPENED: "success",
  PERMISSION_GRANTED: "success",
  INVITE_ACCEPTED: "success",
  EMAIL_SENT: "success",
  EVIDENCE_UPLOADED: "success",
  SIGNED_IN: "success",
  PAID: "success",
  DELETED: "danger",
  DEACTIVATED: "danger",
  REJECTED_CONSULTANT: "danger",
  CLIENT_REJECTED: "danger",
  EMAIL_FAILED: "danger",
  ACCOUNT_LOCKED: "danger",
  PERMISSION_REVOKED: "danger",
  EVIDENCE_REMOVED: "danger",
  RATE_CHANGE_REMOVED: "danger",
  REJECTED_PREV: "warn",
  RECALLED: "warn",
  REQUEST_EXPIRED: "warn",
  EMAIL_SKIPPED: "warn",
  SIGN_IN_FAILED: "warn",
  PASSWORD_CHANGED: "warn",
  PASSWORD_RESET: "warn",
};

export function actionTone(action: string): AuditTone {
  return TONES[action] ?? "neutral";
}

export function actionLabel(action: string, t: Dictionary): string {
  return t.audit.actions[action as keyof Dictionary["audit"]["actions"]] ?? action;
}

export function categoryLabel(category: string, t: Dictionary): string {
  return (
    t.audit.categories[category as keyof Dictionary["audit"]["categories"]] ??
    category
  );
}

export function sourceLabel(source: string, t: Dictionary): string {
  return t.audit.sources[source as keyof Dictionary["audit"]["sources"]] ?? source;
}

export function entityLabel(entityType: string, t: Dictionary): string {
  return t.audit.entities[entityType] ?? entityType;
}

export function statusLabel(status: string, t: Dictionary): string {
  return (
    t.timesheetStatus[status as keyof Dictionary["timesheetStatus"]] ??
    t.audit.statuses[status] ??
    status
  );
}

export function fieldLabel(field: string, t: Dictionary): string {
  return t.audit.fields[field] ?? field.replace(/_/g, " ");
}

export function formatDay(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year!, month! - 1, day!)));
}

function isFlowStep(
  value: unknown,
): value is { seq: number; type: string; name: string | null } {
  return (
    typeof value === "object" &&
    value !== null &&
    "seq" in value &&
    "type" in value
  );
}

export function formatAuditValue(
  field: string,
  value: unknown,
  t: Dictionary,
  locale: Locale,
): string {
  if (value === null || value === undefined || value === "") {
    return t.common.none;
  }
  if (typeof value === "boolean") {
    return value ? t.audit.entry.yes : t.audit.entry.no;
  }

  if (Array.isArray(value)) {
    if (!value.length) return t.common.none;
    return value
      .map((item) => {
        if (!isFlowStep(item)) return String(item);
        const name =
          item.type === "ROLE" && item.name ? roleName(item.name, t) : item.name;
        const type = t.audit.approverTypes[item.type] ?? item.type;
        return `${item.seq}. ${name ?? t.common.none} (${type})`;
      })
      .join(" · ");
  }

  const text = String(value);
  if (field === "role_id") return roleName(text, t);
  if (field === "permission") {
    return text in t.permissions
      ? t.permissions[text as keyof Dictionary["permissions"]].name
      : text;
  }
  if (field === "status") return statusLabel(text, t);
  if (field === "rate_period" && text in t.rates.periods) {
    return t.rates.periods[text as keyof Dictionary["rates"]["periods"]];
  }
  if (field === "contract_type" && text in t.payTerms.contractTypes) {
    return t.payTerms.contractTypes[
      text as keyof Dictionary["payTerms"]["contractTypes"]
    ];
  }
  if (ISO_DATE.test(text)) return formatDay(text, locale);
  if (ISO_DATE_TIME.test(text)) {
    return formatDateTime(text, locale, {
      empty: t.common.none,
      invalid: text,
    });
  }

  return text;
}

export function weekLabel(
  entry: AuditEntry,
  locale: Locale,
): string | null {
  const start = entry.metadata.weekStart;
  const end = entry.metadata.weekEnd;
  if (typeof start !== "string" || typeof end !== "string") return null;
  return `${formatDay(start, locale)} – ${formatDay(end, locale)}`;
}

export function actorName(entry: AuditEntry, t: Dictionary): string {
  if (entry.actor?.name) return entry.actor.name;
  return entry.source === "EXTERNAL" ? t.audit.entry.external : t.audit.entry.system;
}
