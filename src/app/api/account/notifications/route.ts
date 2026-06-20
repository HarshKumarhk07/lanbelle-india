import {
  listNotifications,
  getUnreadCount,
  markAllNotificationsRead,
} from "@/services/notification.service";
import { requireUser } from "@/lib/auth/session";
import { success, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await requireUser();
    const [notifications, unread] = await Promise.all([
      listNotifications(user.id),
      getUnreadCount(user.id),
    ]);
    return success({ notifications, unread }, "Notifications fetched");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH() {
  try {
    const user = await requireUser();
    await markAllNotificationsRead(user.id);
    return success(null, "All notifications marked as read");
  } catch (error) {
    return handleApiError(error);
  }
}
