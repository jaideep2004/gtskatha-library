import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHomepageConfigDocument extends Document {
  heroKatha?: mongoose.Types.ObjectId;
  featuredSeries?: mongoose.Types.ObjectId;
  featuredKatha?: mongoose.Types.ObjectId;
  quote?: string;
}

const HomepageConfigSchema = new Schema<IHomepageConfigDocument>({
  heroKatha: { type: Schema.Types.ObjectId, ref: 'Katha' },
  featuredSeries: { type: Schema.Types.ObjectId, ref: 'Series' },
  featuredKatha: { type: Schema.Types.ObjectId, ref: 'Katha' },
  quote: { type: String },
});

const HomepageConfig: Model<IHomepageConfigDocument> =
  mongoose.models.HomepageConfig ||
  mongoose.model<IHomepageConfigDocument>('HomepageConfig', HomepageConfigSchema);

export default HomepageConfig;
