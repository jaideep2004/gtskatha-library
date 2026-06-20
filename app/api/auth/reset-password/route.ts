import { NextRequest, NextResponse } from 'next/server';
import { enforceRateLimit, PASSWORD_RESET_LIMIT } from '@/lib/rateLimit';
import { resetPassword } from '@/services/passwordResetService';

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, PASSWORD_RESET_LIMIT);
  if (limited) return limited;

  const body: unknown = await req.json();
  const record =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const token = record.token;
  const password = record.password;
  if (
    typeof token !== 'string' ||
    token.length < 32 ||
    token.length > 256 ||
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 128
  ) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired reset request' },
      { status: 400 }
    );
  }

  const changed = await resetPassword(token, password);
  if (!changed) {
    return NextResponse.json(
      { success: false, error: 'This reset link is invalid or expired' },
      { status: 400 }
    );
  }
  return NextResponse.json({
    success: true,
    message: 'Password updated. You can now sign in.',
  });
}
