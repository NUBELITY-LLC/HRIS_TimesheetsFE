export const NOTIFICATION_KINDS = [
  "REVIEW_REQUESTED",
  "APPROVED",
  "REJECTED",
  "REMINDER",
  "TASK_ASSIGNED",
] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export type AppNotification = {
  id: number;
  kind: string | null;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
  timesheetId: number | null;
};

export type NotificationStatusFilter = "unread" | "read" | "all";

export function isKnownKind(kind: string | null): kind is NotificationKind {
  return (NOTIFICATION_KINDS as readonly string[]).includes(kind ?? "");
}
