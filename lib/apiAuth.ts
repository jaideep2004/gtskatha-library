import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

type AuthorizedSession = Session & {
  user: Session['user'] & { id: string };
};

type AuthResult =
  | { authorized: true; session: AuthorizedSession }
  | { authorized: false; response: NextResponse };

export async function requireUser(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return { authorized: true, session: session as AuthorizedSession };
}

export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireUser();
  if (!auth.authorized) return auth;

  if (auth.session.user.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      ),
    };
  }

  return auth;
}
