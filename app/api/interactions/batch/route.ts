import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getInteractionSummaries } from '@/services/timelineInteractionService';

export async function GET(req: NextRequest) {
  try {
    const rawIds = req.nextUrl.searchParams.get('kathaIds') || '';
    const kathaIds = rawIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (kathaIds.length === 0) {
      return NextResponse.json({ success: true, data: { authenticated: false, items: {} } });
    }
    if (kathaIds.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Request too large: at most 50 katha ids' },
        { status: 400 }
      );
    }
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const items = await getInteractionSummaries(kathaIds, userId);
    return NextResponse.json({
      success: true,
      data: {
        authenticated: Boolean(userId),
        items,
      },
    });
  } catch (error) {
    console.error('GET /api/interactions/batch', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load interaction summaries' },
      { status: 500 }
    );
  }
}
