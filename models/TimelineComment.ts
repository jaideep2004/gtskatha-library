import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITimelineCommentDocument extends Document {
  kathaId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  guestKeyHash?: string;
  guestName?: string;
  content: string;
  timestampSeconds: number;
  status: 'active' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const TimelineCommentSchema = new Schema<ITimelineCommentDocument>(
  {
    kathaId: { type: Schema.Types.ObjectId, ref: 'Katha', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    guestKeyHash: { type: String, select: false },
    guestName: { type: String, trim: true, maxlength: 60 },
    content: { type: String, required: true, trim: true, maxlength: 500 },
    timestampSeconds: { type: Number, required: true, min: 0, max: 604_800 },
    status: { type: String, enum: ['active', 'hidden'], default: 'active' },
  },
  { timestamps: true }
);

TimelineCommentSchema.index({ kathaId: 1, status: 1, timestampSeconds: 1, createdAt: 1 });
TimelineCommentSchema.index({ userId: 1, createdAt: -1 });

const TimelineComment: Model<ITimelineCommentDocument> =
  mongoose.models.TimelineComment ||
  mongoose.model<ITimelineCommentDocument>('TimelineComment', TimelineCommentSchema);

export default TimelineComment;
