import mongoose, { Document, Model, Schema } from 'mongoose';

export type CommentAccess = 'everyone' | 'authenticated' | 'disabled';

export interface IInteractionSettingsDocument extends Document {
  key: 'global';
  audioCommentAccess: CommentAccess;
  videoCommentAccess: CommentAccess;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InteractionSettingsSchema = new Schema<IInteractionSettingsDocument>(
  {
    key: { type: String, enum: ['global'], default: 'global', unique: true },
    audioCommentAccess: {
      type: String,
      enum: ['everyone', 'authenticated', 'disabled'],
      default: 'authenticated',
    },
    videoCommentAccess: {
      type: String,
      enum: ['everyone', 'authenticated', 'disabled'],
      default: 'authenticated',
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const InteractionSettings: Model<IInteractionSettingsDocument> =
  mongoose.models.InteractionSettings ||
  mongoose.model<IInteractionSettingsDocument>(
    'InteractionSettings',
    InteractionSettingsSchema
  );

export default InteractionSettings;
