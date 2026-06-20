import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContinueListeningDocument extends Document {
  userId: mongoose.Types.ObjectId;
  kathaId: mongoose.Types.ObjectId;
  currentTime: number;
  duration: number;  
  lastPlayedAt: Date;
  completed: boolean;
}

const ContinueListeningSchema = new Schema<IContinueListeningDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  kathaId: { type: Schema.Types.ObjectId, ref: 'Katha', required: true },
  currentTime: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  lastPlayedAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
});

ContinueListeningSchema.index({ userId: 1, kathaId: 1 }, { unique: true });
ContinueListeningSchema.index({ userId: 1, lastPlayedAt: -1 });

const ContinueListening: Model<IContinueListeningDocument> =
  mongoose.models.ContinueListening ||
  mongoose.model<IContinueListeningDocument>('ContinueListening', ContinueListeningSchema);

export default ContinueListening;
