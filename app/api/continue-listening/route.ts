import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import ContinueListening from '@/models/ContinueListening';
import Katha from '@/models/Katha';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const kathaId = req.nextUrl.searchParams.get('kathaId');
    if (kathaId) {
      if (!mongoose.Types.ObjectId.isValid(kathaId)) {
        return NextResponse.json({ success: false, error: 'Invalid kathaId' }, { status: 400 });
      }
      const item = await ContinueListening.findOne({
        userId: session.user.id,
        kathaId,
      }).lean();
      return NextResponse.json({ success: true, data: item });
    }

    const items = await ContinueListening.find({ userId: session.user.id })
      .sort({ lastPlayedAt: -1 })
      .limit(10)
      .populate({
        path: 'kathaId',
        match: {
          status: { $ne: 'archived' },
          $or: [{ status: 'published' }, { status: { $exists: false }, published: true }],
        },
      })
      .lean();

    return NextResponse.json({ success: true, data: items.filter((item) => item.kathaId) });
  } catch (error) {
    console.error('GET /api/continue-listening', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }
    const { kathaId, currentTime, duration } = body as Record<string, unknown>;
    if (
      typeof kathaId !== 'string'
      || !mongoose.Types.ObjectId.isValid(kathaId)
      || typeof currentTime !== 'number'
      || typeof duration !== 'number'
      || !Number.isFinite(currentTime)
      || !Number.isFinite(duration)
      || currentTime < 0
      || duration < 0
    ) {
      return NextResponse.json({ success: false, error: 'Invalid progress data' }, { status: 400 });
    }

    await connectDB();
    const exists = await Katha.exists({
      _id: kathaId,
      status: { $ne: 'archived' },
      $or: [{ status: 'published' }, { status: { $exists: false }, published: true }],
    });
    if (!exists) {
      return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
    }
    const safeTime = Math.min(currentTime, duration || currentTime);
    const completed = duration > 0 && safeTime / duration >= 0.95;
    const updated = await ContinueListening.findOneAndUpdate(
      { userId: session.user.id, kathaId },
      { currentTime: safeTime, duration, completed, lastPlayedAt: new Date() },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('POST /api/continue-listening', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}
