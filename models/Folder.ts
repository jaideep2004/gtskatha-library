import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFolderDocument extends Document {
  seriesId: mongoose.Types.ObjectId;
  title: string;
  sortOrder: number;
}

const FolderSchema = new Schema<IFolderDocument>({
  seriesId: { type: Schema.Types.ObjectId, ref: 'Series', required: true, index: true },
  title: { type: String, required: true, trim: true },
  sortOrder: { type: Number, default: 0 },
});

FolderSchema.index({ seriesId: 1, sortOrder: 1 });

const Folder: Model<IFolderDocument> =
  mongoose.models.Folder || mongoose.model<IFolderDocument>('Folder', FolderSchema);

export default Folder;
