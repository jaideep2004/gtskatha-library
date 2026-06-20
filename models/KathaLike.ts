import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IKathaLikeDocument extends Document {
  kathaId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const KathaLikeSchema = new Schema<IKathaLikeDocument>(
  {
    kathaId: { type: Schema.Types.ObjectId, ref: 'Katha', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

KathaLikeSchema.index({ kathaId: 1, userId: 1 }, { unique: true });
KathaLikeSchema.index({ kathaId: 1, createdAt: -1 });

const KathaLike: Model<IKathaLikeDocument> =
  mongoose.models.KathaLike ||
  mongoose.model<IKathaLikeDocument>('KathaLike', KathaLikeSchema);

export default KathaLike;
