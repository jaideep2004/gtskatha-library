import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKathaDocument extends Document {
  title: string;
  slug: string;
  description?: string;
  type: 'audio' | 'video';
  thumbnail?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration?: number;
  categoryId?: mongoose.Types.ObjectId;
  seriesId?: mongoose.Types.ObjectId;
  tags: string[];
  featured: boolean;
  published: boolean;
  status: 'draft' | 'published' | 'archived';
  allowDownload: boolean;
  archivedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  authorName?: string;
  chapters?: Array<{
    id: string;
    title: string;
    startTime: number;
    duration: number;
  }>;
  keyTakeaways?: string[];
  references?: string[];
}

const KathaSchema = new Schema<IKathaDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['audio', 'video'], required: true },
    thumbnail: { type: String },
    audioUrl: { type: String },
    videoUrl: { type: String },
    duration: { type: Number },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    seriesId: { type: Schema.Types.ObjectId, ref: 'Series' },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    allowDownload: { type: Boolean, default: false },
    archivedAt: { type: Date },
    views: { type: Number, default: 0 },
    authorName: { type: String, trim: true },
    chapters: [{
      id: { type: String },
      title: { type: String, required: true, trim: true },
      startTime: { type: Number, required: true },
      duration: { type: Number, required: true },
    }],
    keyTakeaways: [{ type: String, trim: true }],
    references: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

KathaSchema.index({ type: 1 });
KathaSchema.index({ categoryId: 1 });
KathaSchema.index({ seriesId: 1 });
KathaSchema.index({ featured: 1 });
KathaSchema.index({ published: 1 });
KathaSchema.index({ status: 1, createdAt: -1 });
KathaSchema.index({ createdAt: -1 });
KathaSchema.index({ views: -1 });
KathaSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Katha: Model<IKathaDocument> =
  mongoose.models.Katha || mongoose.model<IKathaDocument>('Katha', KathaSchema);

export default Katha;
