import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('__session');

  // Paths that are part of the admin section but don't require the sidebar/auth
  const isAuthPage = pathname === '/admin/login';
  
  // All other pages under /admin are protected
  const isProtectedRoute = pathname.startsWith('/admin') && !isAuthPage;

  // If the user is not logged in and tries to access a protected route, redirect to login.
  if (!sessionCookie && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // If the user is logged in and tries to access the login page, redirect to the dashboard.
  if (sessionCookie && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }
  
  // If the user visits the base /admin path, decide where to send them
  if (pathname === '/admin') {
    const url = request.nextUrl.clone()
    url.pathname = sessionCookie ? '/admin/dashboard' : '/admin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
}
