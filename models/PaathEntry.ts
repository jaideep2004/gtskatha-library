import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaathEntryDocument extends Document {
  paathId: mongoose.Types.ObjectId;
  kathaId: mongoose.Types.ObjectId;
  order: number;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaathEntrySchema = new Schema<IPaathEntryDocument>(
  {
    paathId: { type: Schema.Types.ObjectId, ref: 'Paath', required: true },
    kathaId: { type: Schema.Types.ObjectId, ref: 'Katha', required: true },
    order: { type: Number, required: true },
    title: { type: String, trim: true },
  },
  { timestamps: true }
);

PaathEntrySchema.index({ paathId: 1, order: 1 });

const PaathEntry: Model<IPaathEntryDocument> =
  mongoose.models.PaathEntry || mongoose.model<IPaathEntryDocument>('PaathEntry', PaathEntrySchema);

export default PaathEntry;
