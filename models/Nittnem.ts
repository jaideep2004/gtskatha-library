import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INittnemDocument extends Document {
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NittnemSchema = new Schema<INittnemDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    thumbnail: { type: String },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NittnemSchema.index({ sortOrder: 1 });

const Nittnem: Model<INittnemDocument> =
  mongoose.models.Nittnem || mongoose.model<INittnemDocument>('Nittnem', NittnemSchema);

export default Nittnem;
