export const AUDIT_CATEGORIES = [
  "WORKFLOW",
  "NOTIFICATION",
  "EVIDENCE",
  "CATALOG",
  "ASSIGNMENT",
  "USERS",
  "ACCESS",
  "PAYROLL",
] as const;

export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

export const AUDIT_SOURCES = ["USER", "SYSTEM", "EXTERNAL"] as const;

export type AuditSource = (typeof AUDIT_SOURCES)[number];

export const AUDIT_ACTION_GROUPS = {
  workflow: [
    "CREATED",
    "MODIFIED",
    "SUBMITTED",
    "STEP_ENTERED",
    "APPROVED",
    "REJECTED_PREV",
    "REJECTED_CONSULTANT",
    "CLIENT_APPROVED",
    "CLIENT_REJECTED",
    "REQUEST_EXPIRED",
    "RECALLED",
    "CLOSED",
    "REOPENED",
    "PAID",
  ],
  notifications: [
    "NOTIFIED",
    "APPROVAL_EMAIL_SENT",
    "NOTIFICATION_CREATED",
    "EMAIL_SENT",
    "EMAIL_FAILED",
    "EMAIL_SKIPPED",
  ],
  records: [
    "UPDATED",
    "DELETED",
    "ACTIVATED",
    "DEACTIVATED",
    "APPROVAL_FLOW_UPDATED",
    "RATE_CHANGE_SCHEDULED",
    "RATE_CHANGE_REMOVED",
    "PAY_FROZEN",
    "EVIDENCE_UPLOADED",
    "EVIDENCE_REMOVED",
  ],
  access: [
    "SIGNED_IN",
    "SIGN_IN_FAILED",
    "ACCOUNT_LOCKED",
    "PASSWORD_CHANGED",
    "INVITE_SENT",
    "INVITE_ACCEPTED",
    "RESET_REQUESTED",
    "PASSWORD_RESET",
    "PERMISSION_GRANTED",
    "PERMISSION_REVOKED",
  ],
} as const;

export type AuditActionGroup = keyof typeof AUDIT_ACTION_GROUPS;

export type AuditAction =
  (typeof AUDIT_ACTION_GROUPS)[AuditActionGroup][number];

export const AUDIT_ACTIONS: AuditAction[] = Object.values(
  AUDIT_ACTION_GROUPS,
).flat();

export const AUDIT_COLUMNS = [
  "occurredAt",
  "category",
  "action",
  "timesheet",
  "week",
  "project",
  "subject",
  "entity",
  "actor",
  "actorEmail",
  "actorRole",
  "source",
  "fromStatus",
  "toStatus",
  "comments",
  "changes",
  "details",
  "ipAddress",
  "userAgent",
  "requestId",
] as const;

export type AuditColumn = (typeof AUDIT_COLUMNS)[number];

export const DEFAULT_AUDIT_COLUMNS: AuditColumn[] = [
  "occurredAt",
  "category",
  "action",
  "timesheet",
  "project",
  "subject",
  "entity",
  "actor",
  "actorRole",
  "fromStatus",
  "toStatus",
  "comments",
  "changes",
];

export type AuditChange = { from: unknown; to: unknown };

export type AuditEntry = {
  id: number;
  occurredAt: string;
  category: string;
  action: string;
  entityType: string;
  entityId: number | null;
  entityLabel: string | null;
  timesheet: { id: number; code: string | null } | null;
  project: { id: number | null; name: string } | null;
  subject: { id: number | null; name: string } | null;
  actor: {
    id: number | null;
    name: string;
    email: string | null;
    roleCode: string | null;
  } | null;
  source: string;
  fromStatus: string | null;
  toStatus: string | null;
  comments: string | null;
  changes: Record<string, AuditChange>;
  metadata: Record<string, unknown>;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
};

export type AuditOptions = {
  actors: { id: number; fullName: string; email: string; isActive: boolean }[];
  projects: { id: number; name: string; code: string | null }[];
};
