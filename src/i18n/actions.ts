"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "./config";

export async function setLocaleAction(
  _prevState: { status: "idle" | "success" },
  formData: FormData,
): Promise<{ status: "idle" | "success" }> {
  const requested = formData.get("locale");
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");

  return { status: "success" };
}
