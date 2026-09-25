import { NotificationsMenu } from "@/components/layout/notifications-menu";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
} from "@/lib/notifications/queries";

const MENU_PAGE_SIZE = 8;

export async function Topbar() {
  const [unreadCount, recent] = await Promise.all([
    fetchUnreadNotificationCount(),
    fetchNotifications({ page: 1, pageSize: MENU_PAGE_SIZE, status: "all" }),
  ]);

  return (
    <header className="flex items-center justify-end gap-2 border-b border-line bg-surface px-5 py-3 lg:px-8">
      <NotificationsMenu
        notifications={recent.ok ? recent.notifications : []}
        unreadCount={unreadCount}
      />
    </header>
  );
}
