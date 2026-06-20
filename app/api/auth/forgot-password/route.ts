import { NextRequest, NextResponse } from 'next/server';
import { enforceRateLimit, PASSWORD_RESET_LIMIT } from '@/lib/rateLimit';
import { requestPasswordReset } from '@/services/passwordResetService';

const GENERIC_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, PASSWORD_RESET_LIMIT);
  if (limited) return limited;

  const body: unknown = await req.json();
  const email =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>).email
      : null;
  if (
    typeof email !== 'string' ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return NextResponse.json(
      { success: false, error: 'Enter a valid email address' },
      { status: 400 }
    );
  }

  try {
    await requestPasswordReset(email);
  } catch (error) {
    // Keep response generic to prevent account enumeration and SMTP detail leaks.
    console.error('POST /api/auth/forgot-password', error instanceof Error ? error.message : error);
  }
  return NextResponse.json({ success: true, message: GENERIC_MESSAGE }, { status: 202 });
}
