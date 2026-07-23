import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaathDocument extends Document {
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaathSchema = new Schema<IPaathDocument>(
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

PaathSchema.index({ sortOrder: 1 });

const Paath: Model<IPaathDocument> =
  mongoose.models.Paath || mongoose.model<IPaathDocument>('Paath', PaathSchema);

export default Paath;
