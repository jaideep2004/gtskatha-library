import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IKathaNoteDocument extends Document {
  userId: mongoose.Types.ObjectId;
  kathaId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const KathaNoteSchema = new Schema<IKathaNoteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    kathaId: { type: Schema.Types.ObjectId, ref: 'Katha', required: true },
    content: { type: String, default: '', maxlength: 20_000 },
  },
  { timestamps: true }
);

KathaNoteSchema.index({ userId: 1, kathaId: 1 }, { unique: true });

const KathaNote: Model<IKathaNoteDocument> =
  mongoose.models.KathaNote ||
  mongoose.model<IKathaNoteDocument>('KathaNote', KathaNoteSchema);

export default KathaNote;
