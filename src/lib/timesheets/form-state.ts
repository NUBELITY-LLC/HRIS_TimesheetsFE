export type TimesheetFormState = {
  status: "idle" | "draft" | "submitted" | "error";
  message: string | null;
  code: string | null;
  issues: string[];
  submissionCode: string | null;
};

export const INITIAL_TIMESHEET_FORM_STATE: TimesheetFormState = {
  status: "idle",
  message: null,
  code: null,
  issues: [],
  submissionCode: null,
};

export type DraftActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const INITIAL_DRAFT_ACTION_STATE: DraftActionState = {
  status: "idle",
  message: null,
};

export type DraftDayPayload = {
  date: string;
  activities: { minutes: number; activity: string }[];
};
