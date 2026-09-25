export type NotificationActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const INITIAL_NOTIFICATION_ACTION_STATE: NotificationActionState = {
  status: "idle",
  message: null,
};
