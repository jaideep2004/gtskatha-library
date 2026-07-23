import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFavoriteDocument extends Document {
  userId: mongoose.Types.ObjectId;
  kathaId: mongoose.Types.ObjectId;
  itemType: 'katha' | 'series' | 'paath' | 'nittnem';
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavoriteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    kathaId: { type: Schema.Types.ObjectId, ref: 'Katha', required: true },
    itemType: { type: String, enum: ['katha', 'series', 'paath', 'nittnem'], default: 'katha' },
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, kathaId: 1, itemType: 1 }, { unique: true });
FavoriteSchema.index({ userId: 1, createdAt: -1 });

const Favorite: Model<IFavoriteDocument> =
  mongoose.models.Favorite || mongoose.model<IFavoriteDocument>('Favorite', FavoriteSchema);

export default Favorite;
