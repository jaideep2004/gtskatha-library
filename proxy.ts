import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    const destination = token.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // Admin routes — require admin role
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // User account routes — require any authenticated user
  if (pathname.startsWith('/profile') || pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/dashboard/:path*', '/login', '/register'],
};
