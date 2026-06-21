import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/apiAuth';
import connectDB from '@/lib/db';
import Katha from '@/models/Katha';
import KathaNote from '@/models/KathaNote';

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.authorized) return auth.response;

  const kathaId = req.nextUrl.searchParams.get('kathaId');
  if (!kathaId || !mongoose.Types.ObjectId.isValid(kathaId)) {
    return NextResponse.json({ success: false, error: 'Invalid kathaId' }, { status: 400 });
  }

  await connectDB();
  const note = await KathaNote.findOne({
    userId: auth.session.user.id,
    kathaId,
  }).lean();

  return NextResponse.json({
    success: true,
    data: { content: note?.content ?? '', updatedAt: note?.updatedAt ?? null },
  });
}

export async function PUT(req: NextRequest) {
  const auth = await requireUser();
  if (!auth.authorized) return auth.response;

  const body: unknown = await req.json();
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { kathaId, content } = body as Record<string, unknown>;
  if (
    typeof kathaId !== 'string'
    || !mongoose.Types.ObjectId.isValid(kathaId)
    || typeof content !== 'string'
    || content.length > 20_000
  ) {
    return NextResponse.json({ success: false, error: 'Invalid note data' }, { status: 400 });
  }

  await connectDB();
  const exists = await Katha.exists({ _id: kathaId });
  if (!exists) {
    return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
  }

  const note = await KathaNote.findOneAndUpdate(
    { userId: auth.session.user.id, kathaId },
    { $set: { content: content.trim() } },
    { returnDocument: "after", upsert: true, runValidators: true }
  ).lean();

  return NextResponse.json({ success: true, data: note });
}
