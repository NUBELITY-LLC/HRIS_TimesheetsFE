"use server";

import { revalidatePath } from "next/cache";

import { apiRequest } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session";
import { DEFAULT_LOCALE, isLocale } from "./config";
import { storeLocale } from "./server";

export async function setLocaleAction(
  _prevState: { status: "idle" | "success" },
  formData: FormData,
): Promise<{ status: "idle" | "success" }> {
  const requested = formData.get("locale");
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;

  const token = await getSessionToken();
  if (token) {
    await apiRequest<{ locale: string }>("/auth/me/locale", {
      method: "PATCH",
      token,
      body: { locale },
    });
  }

  await storeLocale(locale);

  revalidatePath("/", "layout");

  return { status: "success" };
}
