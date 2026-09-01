import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { apiRequest } from "@/lib/api/client";
import type { AuthenticatedUser } from "@/lib/api/types";
import { SESSION_COOKIE } from "./cookie";

export async function createSession(
  accessToken: string,
  expiresInSeconds: number,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresInSeconds,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export const getCurrentUser = cache(
  async (): Promise<AuthenticatedUser | null> => {
    const token = await getSessionToken();
    if (!token) return null;

    const result = await apiRequest<{ user: AuthenticatedUser }>("/auth/me", {
      token,
    });

    return result.ok ? result.data.user : null;
  },
);

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?reason=session_expired");
  return user;
}
