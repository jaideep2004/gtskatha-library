import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAuditLogDocument extends Document {
  actorId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  entitySlug?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId },
    entitySlug: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });

const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLog;
