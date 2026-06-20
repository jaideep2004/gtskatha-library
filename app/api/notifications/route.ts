import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, createNotification } from '@/services/notificationService';
import { requireAdmin } from '@/lib/apiAuth';
import { ADMIN_MUTATION_LIMIT, enforceRateLimit } from '@/lib/rateLimit';
import { ValidationError, validateNotificationInput } from '@/lib/validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserNotifications, markAsRead } from '@/services/notificationService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id && session.user.role !== 'admin') {
      const notifications = await getUserNotifications(session.user.id);
      return NextResponse.json({ success: true, data: notifications });
    }
    const notifications = await getNotifications();
    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('GET /api/notifications', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const body: unknown = await req.json();
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
  const notificationId = (body as Record<string, unknown>).notificationId;
  if (typeof notificationId !== 'string') {
    return NextResponse.json({ success: false, error: 'notificationId is required' }, { status: 400 });
  }
  const receipt = await markAsRead(session.user.id, notificationId);
  return NextResponse.json({ success: true, data: receipt });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;
    const limited = enforceRateLimit(req, ADMIN_MUTATION_LIMIT);
    if (limited) return limited;

    const body = validateNotificationInput(await req.json());
    const notification = await createNotification(body);
    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('POST /api/notifications', error);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}
