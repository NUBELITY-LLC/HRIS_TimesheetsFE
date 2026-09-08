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

export type DraftDayPayload = {
  date: string;
  activities: { minutes: number; activity: string }[];
};
