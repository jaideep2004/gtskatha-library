import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPasswordResetTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PasswordResetTokenSchema.index({ userId: 1, createdAt: -1 });

const PasswordResetToken: Model<IPasswordResetTokenDocument> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetTokenDocument>(
    'PasswordResetToken',
    PasswordResetTokenSchema
  );

export default PasswordResetToken;
