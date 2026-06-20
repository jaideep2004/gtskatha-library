import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getInteractionSnapshot } from '@/services/timelineInteractionService';

export async function GET(req: NextRequest) {
  try {
    const kathaId = req.nextUrl.searchParams.get('kathaId') || '';
    const session = await getServerSession(authOptions);
    const snapshot = await getInteractionSnapshot(kathaId, session?.user?.id);
    if (!snapshot) {
      return NextResponse.json({ success: false, error: 'Katha not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: snapshot });
  } catch (error) {
    console.error('GET /api/interactions', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load interactions' },
      { status: 500 }
    );
  }
}
