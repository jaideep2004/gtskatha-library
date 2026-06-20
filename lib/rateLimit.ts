import { NextRequest, NextResponse } from 'next/server';

interface RateLimitPolicy {
  limit: number;
  windowMs: number;
  scope: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function getClientAddress(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

export function enforceRateLimit(
  req: NextRequest,
  policy: RateLimitPolicy
): NextResponse | null {
  const now = Date.now();
  const key = `${policy.scope}:${getClientAddress(req)}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + policy.windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= policy.limit) return null;

  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return NextResponse.json(
    { success: false, error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    }
  );
}

export const ADMIN_MUTATION_LIMIT = {
  limit: 120,
  windowMs: 60_000,
  scope: 'admin-mutation',
} satisfies RateLimitPolicy;

export const UPLOAD_LIMIT = {
  limit: 20,
  windowMs: 60_000,
  scope: 'media-upload',
} satisfies RateLimitPolicy;

export const REGISTRATION_LIMIT = {
  limit: 5,
  windowMs: 15 * 60_000,
  scope: 'registration',
} satisfies RateLimitPolicy;

export const VIEW_EVENT_LIMIT = {
  limit: 30,
  windowMs: 60_000,
  scope: 'qualified-view',
} satisfies RateLimitPolicy;

export const TIMELINE_COMMENT_LIMIT = {
  limit: 8,
  windowMs: 60_000,
  scope: 'timeline-comment',
} satisfies RateLimitPolicy;

export const TIMELINE_LIKE_LIMIT = {
  limit: 30,
  windowMs: 60_000,
  scope: 'timeline-like',
} satisfies RateLimitPolicy;

export const PASSWORD_RESET_LIMIT = {
  limit: 5,
  windowMs: 15 * 60_000,
  scope: 'password-reset',
} satisfies RateLimitPolicy;
