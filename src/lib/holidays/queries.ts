import "server-only";

import { apiRequest } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session";
import type { Holiday } from "./types";

export async function fetchHolidays(
  year: number,
  countryCode: string,
): Promise<Holiday[] | null> {
  const token = await getSessionToken();
  const params = new URLSearchParams({ year: String(year), countryCode });
  const result = await apiRequest<{ holidays: Holiday[] }>(
    `/holidays?${params.toString()}`,
    { token },
  );

  return result.ok ? result.data.holidays : null;
}
