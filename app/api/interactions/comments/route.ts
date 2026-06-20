import { createHash, randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { enforceRateLimit, TIMELINE_COMMENT_LIMIT } from '@/lib/rateLimit';
import { ValidationError, validateTimelineCommentInput } from '@/lib/validation';
import { createTimelineComment } from '@/services/timelineInteractionService';

const GUEST_COOKIE = 'katha_guest';

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, TIMELINE_COMMENT_LIMIT);
    if (limited) return limited;

    const body = validateTimelineCommentInput(await req.json());
    const session = await getServerSession(authOptions);
    const existingGuestKey = req.cookies.get(GUEST_COOKIE)?.value;
    const guestKey = existingGuestKey || randomUUID();
    const secret = process.env.NEXTAUTH_SECRET;
    if (!session?.user?.id && !secret) {
      return NextResponse.json(
        { success: false, error: 'Guest comments are temporarily unavailable' },
        { status: 503 }
      );
    }
    const guestKeyHash = session?.user?.id
      ? undefined
      : createHash('sha256').update(`${secret}:${guestKey}`).digest('hex');

    const result = await createTimelineComment({
      ...body,
      userId: session?.user?.id,
      guestKeyHash,
    });
    if ('error' in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    const response = NextResponse.json({ success: true, data: result.data }, { status: 201 });
    if (!session?.user?.id && !existingGuestKey) {
      response.cookies.set(GUEST_COOKIE, guestKey, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }
    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('POST /api/interactions/comments', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
