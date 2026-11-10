export const FEEDBACK_CATEGORIES = [
  "WORK_ENVIRONMENT",
  "HARASSMENT",
  "WORKLOAD",
  "PROJECT_CLIENT",
  "TOOLS",
  "SUGGESTION",
  "OTHER",
] as const;

export const FEEDBACK_STATUSES = ["NEW", "IN_REVIEW", "RESOLVED", "ARCHIVED"] as const;

export const FEEDBACK_NOTE_KINDS = ["INTERNAL", "REPLY"] as const;

export const FEEDBACK_BODY_MAX = 5000;
export const FEEDBACK_EVIDENCE_MAX = 3;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];
export type FeedbackNoteKind = (typeof FEEDBACK_NOTE_KINDS)[number];

export function isFeedbackCategory(value: string): value is FeedbackCategory {
  return (FEEDBACK_CATEGORIES as readonly string[]).includes(value);
}

export function isFeedbackStatus(value: string): value is FeedbackStatus {
  return (FEEDBACK_STATUSES as readonly string[]).includes(value);
}

export function isFeedbackNoteKind(value: string): value is FeedbackNoteKind {
  return (FEEDBACK_NOTE_KINDS as readonly string[]).includes(value);
}

export type FeedbackListItem = {
  id: number;
  category: FeedbackCategory;
  status: FeedbackStatus;
  submittedOn: string;
  excerpt: string;
  attachmentCount: number;
  noteCount: number;
};

export type FeedbackNote = {
  id: number;
  kind: FeedbackNoteKind;
  body: string;
  createdAt: string;
  author: { id: number | null; name: string } | null;
};

export type FeedbackAttachment = {
  id: number;
  position: number;
  mimeType: string;
  sizeBytes: number;
  fileName: string;
};

export type FeedbackCase = {
  id: number;
  category: FeedbackCategory;
  status: FeedbackStatus;
  submittedOn: string;
  body: string;
  resolution: string | null;
  statusChangedAt: string | null;
  attachments: FeedbackAttachment[];
  notes: FeedbackNote[];
};

export type FeedbackTracking = {
  category: FeedbackCategory;
  status: FeedbackStatus;
  submittedOn: string;
  resolution: string | null;
  replies: { body: string; createdAt: string }[];
};

export type FeedbackReport = {
  total: number;
  byStatus: Record<FeedbackStatus, number>;
  byCategory: {
    category: FeedbackCategory;
    total: number;
    byStatus: Record<FeedbackStatus, number>;
  }[];
  byMonth: { month: string; total: number }[];
};

export type FeedbackFilters = {
  from: string;
  to: string;
  status: FeedbackStatus | "";
  category: FeedbackCategory | "";
  page: number;
};

export type SubmitFeedbackState = {
  status: "idle" | "error" | "sent";
  message: string | null;
  fieldErrors: Partial<Record<"category" | "body" | "evidence", string>>;
  trackingCode: string | null;
};

export const INITIAL_SUBMIT_FEEDBACK_STATE: SubmitFeedbackState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  trackingCode: null,
};

export type TrackFeedbackState = {
  status: "idle" | "error" | "found";
  message: string | null;
  code: string;
  result: FeedbackTracking | null;
};

export const INITIAL_TRACK_FEEDBACK_STATE: TrackFeedbackState = {
  status: "idle",
  message: null,
  code: "",
  result: null,
};

export type FeedbackActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<"resolution" | "body", string>>;
  savedAt: number | null;
};

export const INITIAL_FEEDBACK_ACTION_STATE: FeedbackActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  savedAt: null,
};
