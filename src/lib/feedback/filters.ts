import {
  isFeedbackCategory,
  isFeedbackStatus,
  type FeedbackFilters,
} from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function parseFeedbackFilters(params: Params): FeedbackFilters {
  const from = first(params.from);
  const to = first(params.to);
  const status = first(params.status);
  const category = first(params.category);
  const page = Number(first(params.page));

  return {
    from: ISO_DATE.test(from) ? from : "",
    to: ISO_DATE.test(to) ? to : "",
    status: isFeedbackStatus(status) ? status : "",
    category: isFeedbackCategory(category) ? category : "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function feedbackQuery(filters: Partial<FeedbackFilters>): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}
