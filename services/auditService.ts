import connectDB from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function recordAudit(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  entitySlug?: string;
  metadata?: Record<string, unknown>;
}) {
  await connectDB();
  return AuditLog.create(input);
}
