import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';
import { enforceRateLimit, TIMELINE_LIKE_LIMIT } from '@/lib/rateLimit';
import { setKathaLike } from '@/services/timelineInteractionService';

async function mutate(req: NextRequest, liked: boolean) {
  const auth = await requireUser();
  if (!auth.authorized) return auth.response;
  const limited = enforceRateLimit(req, TIMELINE_LIKE_LIMIT);
  if (limited) return limited;

  const body: unknown = await req.json();
  const kathaId =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>).kathaId
      : null;
  if (typeof kathaId !== 'string' || !mongoose.Types.ObjectId.isValid(kathaId)) {
    return NextResponse.json({ success: false, error: 'Valid kathaId is required' }, { status: 400 });
  }

  const data = await setKathaLike(kathaId, auth.session.user.id, liked);
  if (!data) {
    return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  try {
    return await mutate(req, true);
  } catch (error) {
    console.error('POST /api/interactions/likes', error);
    return NextResponse.json({ success: false, error: 'Failed to like Katha' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return await mutate(req, false);
  } catch (error) {
    console.error('DELETE /api/interactions/likes', error);
    return NextResponse.json({ success: false, error: 'Failed to remove like' }, { status: 500 });
  }
}
