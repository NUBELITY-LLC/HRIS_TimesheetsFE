export type Holiday = {
  id: number;
  countryCode: string;
  date: string;
  name: string;
};

export type HolidayFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Partial<Record<"date" | "name", string>>;
  savedAt: number | null;
};

export const INITIAL_HOLIDAY_FORM_STATE: HolidayFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  savedAt: null,
};
