import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  archived: boolean;
  archivedAt?: Date;
}

const CategorySchema = new Schema<ICategoryDocument>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String },
  thumbnail: { type: String },
  archived: { type: Boolean, default: false, index: true },
  archivedAt: { type: Date },
});

const Category: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);

export default Category;
