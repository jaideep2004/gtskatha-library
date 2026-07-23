import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INittnemEntryDocument extends Document {
  nittnemId: mongoose.Types.ObjectId;
  kathaId: mongoose.Types.ObjectId;
  order: number;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NittnemEntrySchema = new Schema<INittnemEntryDocument>(
  {
    nittnemId: { type: Schema.Types.ObjectId, ref: 'Nittnem', required: true },
    kathaId: { type: Schema.Types.ObjectId, ref: 'Katha', required: true },
    order: { type: Number, required: true },
    title: { type: String, trim: true },
  },
  { timestamps: true }
);

NittnemEntrySchema.index({ nittnemId: 1, order: 1 });

const NittnemEntry: Model<INittnemEntryDocument> =
  mongoose.models.NittnemEntry || mongoose.model<INittnemEntryDocument>('NittnemEntry', NittnemEntrySchema);

export default NittnemEntry;
