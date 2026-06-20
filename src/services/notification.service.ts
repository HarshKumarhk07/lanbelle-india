import { connectDB } from "@/lib/db";
import { Notification, type NotificationType } from "@/models/notification.model";
import type { NotificationDTO } from "@/types";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  await connectDB();
  await Notification.create({
    user: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
  });
}

export async function listNotifications(
  userId: string,
  limit = 30,
): Promise<NotificationDTO[]> {
  await connectDB();
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return notifications.map((n) => ({
    id: String(n._id),
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  await connectDB();
  return Notification.countDocuments({ user: userId, isRead: false });
}

export async function markNotificationRead(
  userId: string,
  id: string,
): Promise<void> {
  await connectDB();
  await Notification.updateOne({ _id: id, user: userId }, { isRead: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await connectDB();
  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true },
  );
}
