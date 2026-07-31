import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/apiAuth';
import connectDB from '@/lib/db';
import Katha from '@/models/Katha';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.authorized) return auth.response;

    const seriesId = req.nextUrl.searchParams.get('seriesId') || '';
    if (!mongoose.Types.ObjectId.isValid(seriesId)) {
      return NextResponse.json({ success: false, error: 'seriesId is required' }, { status: 400 });
    }

    await connectDB();
    const top = await Katha.findOne({
      seriesId: new mongoose.Types.ObjectId(seriesId),
      status: { $ne: 'archived' },
    })
      .sort({ sortOrder: -1, createdAt: -1 })
      .select('sortOrder')
      .lean();

    return NextResponse.json({ success: true, data: { maxSort: top?.sortOrder ?? -1 } });
  } catch (error) {
    console.error('GET /api/admin/kathas/sort-base', error);
    return NextResponse.json({ success: false, error: 'Failed to compute sort base' }, { status: 500 });
  }
}
