import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISeriesDocument extends Document {
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  featured: boolean;
  sortOrder: number;
  archived: boolean;
  archivedAt?: Date;
}

const SeriesSchema = new Schema<ISeriesDocument>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String },
  thumbnail: { type: String },
  featured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  archived: { type: Boolean, default: false, index: true },
  archivedAt: { type: Date },
});

SeriesSchema.index({ featured: 1, sortOrder: 1 });

const Series: Model<ISeriesDocument> =
  mongoose.models.Series || mongoose.model<ISeriesDocument>('Series', SeriesSchema);

export default Series;
