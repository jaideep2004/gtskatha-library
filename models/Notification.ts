import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationDocument extends Document {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'announcement';
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'announcement'],
      default: 'info',
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', NotificationSchema);

export default Notification;
