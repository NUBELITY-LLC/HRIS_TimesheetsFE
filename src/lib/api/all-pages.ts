import "server-only";

import type { Pagination } from "@/lib/api/types";

const PAGE_SIZE = 50;
const MAX_PAGES = 20;

type PageResult<T> =
  | { ok: true; items: T[]; pagination: Pagination }
  | { ok: false; message: string };

export async function fetchAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<PageResult<T>>,
): Promise<{ ok: true; items: T[] } | { ok: false; message: string }> {
  const first = await fetchPage(1, PAGE_SIZE);
  if (!first.ok) return first;

  const lastPage = Math.min(first.pagination.totalPages, MAX_PAGES);
  const rest =
    lastPage > 1
      ? await Promise.all(
          Array.from({ length: lastPage - 1 }, (_, index) =>
            fetchPage(index + 2, PAGE_SIZE),
          ),
        )
      : [];

  const items = [...first.items];
  for (const result of rest) {
    if (!result.ok) return result;
    items.push(...result.items);
  }

  return { ok: true, items };
}
