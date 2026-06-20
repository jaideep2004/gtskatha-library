import { NextRequest, NextResponse } from 'next/server';
import { getKathas } from '@/services/kathaService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get('q') ?? '';

    if (!q.trim()) {
      return NextResponse.json({ success: true, data: [], total: 0 });
    }

    const result = await getKathas({
      q,
      type: (searchParams.get('type') as 'audio' | 'video') ?? undefined,
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('GET /api/search', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
