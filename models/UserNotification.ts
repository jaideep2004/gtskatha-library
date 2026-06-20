import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserNotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  notificationId: mongoose.Types.ObjectId;
  isRead: boolean;
}

const UserNotificationSchema = new Schema<IUserNotificationDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notificationId: { type: Schema.Types.ObjectId, ref: 'Notification', required: true },
  isRead: { type: Boolean, default: false },
});

UserNotificationSchema.index({ userId: 1, isRead: 1 });
UserNotificationSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

const UserNotification: Model<IUserNotificationDocument> =
  mongoose.models.UserNotification ||
  mongoose.model<IUserNotificationDocument>('UserNotification', UserNotificationSchema);

export default UserNotification;
