/**
 * Next.js Edge Middleware – route protection.
 *
 * Public routes (no token required):
 *   /login
 *   /api/auth/*       (login / logout / me)
 *   /api/migrate      (one-shot DB migration)
 *   /api/init*        (DB initialization)
 *   /_next/*  /favicon.ico  (static assets)
 *
 * Everything else requires a valid lt_token cookie.
 * Token validity is fully verified in each API route (Node.js crypto).
 * Here we only check for cookie presence to keep the Edge bundle tiny.
 */
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/migrate',
  '/api/init',
  '/api/init-simple',
  '/api/save-screenshot',   // temporary – doc generation
  '/doc-screenshots',       // temporary – doc generation
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.png'
  ) {
    return NextResponse.next();
  }

  // Always allow explicitly public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('lt_token')?.value;

  if (!token) {
    // API request → 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    // Page request → redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *  - _next/static (static files)
     *  - _next/image  (image optimisation)
     *  - favicon
     */
    '/((?!_next/static|_next/image|favicon).*)',
  ],
};
