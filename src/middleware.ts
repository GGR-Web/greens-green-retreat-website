import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session');

  // Public admin page(s)
  const isAuthPage = pathname === '/admin/login';

  // All other /admin paths are protected
  const isProtectedRoute = pathname.startsWith('/admin') && !isAuthPage;

  // Not logged in → redirect to /admin/login
  if (!sessionCookie && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Logged in and trying to visit /admin/login → send to dashboard
  if (sessionCookie && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  // Visiting bare /admin → route based on auth
  if (pathname === '/admin') {
    const url = request.nextUrl.clone();
    url.pathname = sessionCookie ? '/admin/dashboard' : '/admin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only run on admin routes
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
