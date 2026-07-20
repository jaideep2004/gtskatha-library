import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import UserNotification from '@/models/UserNotification';

export async function getNotifications(limit = 20) {
  await connectDB();
  return Notification.find().sort({ createdAt: -1 }).limit(limit).lean();
}

export async function createNotification(data: {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'announcement';
}) {
  await connectDB();
  const n = new Notification(data);
  return n.save();
}

export async function getUserNotifications(userId: string) {
  await connectDB();
  const [notifications, receipts] = await Promise.all([
    Notification.find().sort({ createdAt: -1 }).limit(50).lean(),
    UserNotification.find({ userId }).lean(),
  ]);
  const readIds = new Set(receipts.filter((item) => item.isRead).map((item) => String(item.notificationId)));
  return notifications.map((notification) => ({
    ...notification,
    isRead: readIds.has(String(notification._id)),
  }));
}

export async function markAsRead(userId: string, notificationId: string) {
  await connectDB();
  return UserNotification.findOneAndUpdate(
    { userId, notificationId },
    { isRead: true },
    { returnDocument: "after", upsert: true }
  );
}

export async function deleteNotification(id: string) {
  await connectDB();
  const notification = await Notification.findByIdAndDelete(id);
  if (!notification) return null;
  await UserNotification.deleteMany({ notificationId: id });
  return notification;
}

export async function getUnreadCount(userId: string): Promise<number> {
  await connectDB();
  const [total, read] = await Promise.all([
    Notification.countDocuments(),
    UserNotification.countDocuments({ userId, isRead: true }),
  ]);
  return Math.max(0, total - read);
}
