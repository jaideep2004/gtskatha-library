import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: 'user' | 'admin';
  sessionVersion: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    sessionVersion: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
