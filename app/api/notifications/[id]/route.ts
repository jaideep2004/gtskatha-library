import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { DomainError } from '@/lib/domainError';
import { deleteNotification } from '@/services/notificationService';
import { recordAudit } from '@/services/auditService';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(_req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const { id } = await params;
    const result = await deleteNotification(id);
    if (!result) {
      return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 });
    }

    await recordAudit({
      actorId: auth.session.user.id,
      action: 'notification.delete',
      entityType: 'Notification',
      entityId: id,
    });

    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    console.error('DELETE /api/notifications/[id]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 });
  }
}
