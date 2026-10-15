import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { AccountLinkView } from "@/lib/api/types";
import {
  ACCOUNT_LINK_ENDPOINTS,
  type AccountLinkPurpose,
} from "./account-link-state";

export type AccountLinkLookup =
  | { status: "valid"; link: AccountLinkView }
  | { status: "invalid" }
  | { status: "unavailable" };

export async function fetchAccountLink(
  purpose: AccountLinkPurpose,
  token: string,
): Promise<AccountLinkLookup> {
  const result = await apiRequest<{ link: AccountLinkView }>(
    ACCOUNT_LINK_ENDPOINTS[purpose].describe(token),
  );

  if (result.ok) return { status: "valid", link: result.data.link };
  if (result.status === 404 || result.status === 400) return { status: "invalid" };
  return { status: "unavailable" };
}
