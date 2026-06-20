import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IKathaViewEventDocument extends Document {
  kathaId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  sessionKey: string;
  watchedSeconds: number;
  createdAt: Date;
}

const KathaViewEventSchema = new Schema<IKathaViewEventDocument>(
  {
    kathaId: { type: Schema.Types.ObjectId, ref: 'Katha', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionKey: { type: String, required: true, trim: true },
    watchedSeconds: { type: Number, min: 0, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

KathaViewEventSchema.index({ kathaId: 1, sessionKey: 1 }, { unique: true });
KathaViewEventSchema.index({ createdAt: -1 });

const KathaViewEvent: Model<IKathaViewEventDocument> =
  mongoose.models.KathaViewEvent ||
  mongoose.model<IKathaViewEventDocument>('KathaViewEvent', KathaViewEventSchema);

export default KathaViewEvent;
