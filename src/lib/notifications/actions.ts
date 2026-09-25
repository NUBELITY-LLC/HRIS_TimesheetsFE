"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDictionary } from "@/i18n/server";
import { apiRequest } from "@/lib/api/client";
import { getSessionToken } from "@/lib/auth/session";
import {
  INITIAL_NOTIFICATION_ACTION_STATE,
  type NotificationActionState,
} from "./form-state";
import type { AppNotification } from "./types";

function refreshNotifications() {
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  refresh();
}

export async function markNotificationReadAction(
  _prevState: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  const t = await getDictionary();
  const id = Number(formData.get("notificationId"));

  if (!Number.isInteger(id) || id <= 0) {
    return { status: "error", message: t.notifications.errors.fallback };
  }

  const token = await getSessionToken();
  const result = await apiRequest<{ notification: AppNotification }>(
    `/notifications/${id}/read`,
    { method: "PATCH", token },
  );

  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=session_expired");
    return {
      status: "error",
      message: result.error.message ?? t.notifications.errors.fallback,
    };
  }

  refreshNotifications();

  return { ...INITIAL_NOTIFICATION_ACTION_STATE, status: "success" };
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const token = await getSessionToken();
  const result = await apiRequest<{ updated: number }>(
    "/notifications/read-all",
    { method: "POST", token },
  );

  if (!result.ok && result.status === 401) {
    redirect("/login?reason=session_expired");
  }

  refreshNotifications();
}
