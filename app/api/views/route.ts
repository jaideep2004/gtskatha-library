import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { enforceRateLimit, VIEW_EVENT_LIMIT } from '@/lib/rateLimit';
import Katha from '@/models/Katha';
import KathaViewEvent from '@/models/KathaViewEvent';

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, VIEW_EVENT_LIMIT);
    if (limited) return limited;

    const body = await req.json();
    const kathaId = typeof body.kathaId === 'string' ? body.kathaId : '';
    const sessionKey = typeof body.sessionKey === 'string' ? body.sessionKey.trim() : '';
    const watchedSeconds = Number(body.watchedSeconds);

    if (
      !mongoose.Types.ObjectId.isValid(kathaId)
      || sessionKey.length < 8
      || sessionKey.length > 128
      || !Number.isFinite(watchedSeconds)
      || watchedSeconds < 30
    ) {
      return NextResponse.json({ success: false, error: 'Invalid view event' }, { status: 400 });
    }

    await connectDB();
    const katha = await Katha.exists({
      _id: kathaId,
      status: { $ne: 'archived' },
      $or: [{ status: 'published' }, { status: { $exists: false }, published: true }],
    });
    if (!katha) {
      return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const result = await KathaViewEvent.updateOne(
      { kathaId, sessionKey },
      {
        $setOnInsert: {
          kathaId,
          sessionKey,
          userId: session?.user?.id || undefined,
          watchedSeconds: Math.floor(watchedSeconds),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount === 1) {
      await Katha.updateOne({ _id: kathaId }, { $inc: { views: 1 } });
    }

    return NextResponse.json({ success: true, counted: result.upsertedCount === 1 });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ success: false, error: 'Invalid view event' }, { status: 400 });
    }
    console.error('POST /api/views', error);
    return NextResponse.json({ success: false, error: 'Failed to record view' }, { status: 500 });
  }
}
