import "server-only";

import { headers } from "next/headers";

export async function clientContextHeaders(): Promise<Record<string, string>> {
  try {
    const incoming = await headers();
    const result: Record<string, string> = {};

    const ip =
      incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      incoming.get("x-real-ip")?.trim();
    if (ip) result["x-client-ip"] = ip;

    const agent = incoming.get("user-agent")?.trim();
    if (agent) result["x-client-user-agent"] = agent.slice(0, 400);

    return result;
  } catch {
    return {};
  }
}
