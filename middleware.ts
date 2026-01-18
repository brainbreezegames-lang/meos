import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Check for goos.io subdomain pattern
  // Production: username.goos.io
  // Development: username.localhost:3000 or username.lvh.me:3000
  const productionMatch = host.match(/^([a-z0-9][a-z0-9-]{0,38})\.goos\.io$/i);
  const devLocalMatch = process.env.NODE_ENV === 'development' &&
    host.match(/^([a-z0-9][a-z0-9-]{0,38})\.localhost(:\d+)?$/i);
  const devLvhMatch = process.env.NODE_ENV === 'development' &&
    host.match(/^([a-z0-9][a-z0-9-]{0,38})\.lvh\.me(:\d+)?$/i);

  const match = productionMatch || devLocalMatch || devLvhMatch;

  if (match) {
    const username = match[1].toLowerCase();

    // Don't rewrite API routes or static files
    if (url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/_next/') ||
        url.pathname.startsWith('/favicon') ||
        url.pathname.includes('.')) {
      return NextResponse.next();
    }

    // Rewrite to public goOS view
    // username.goos.io/ -> /goos/[username]
    // username.goos.io/file/123 -> /goos/[username]/file/123
    const newPath = `/goos/${username}${url.pathname === '/' ? '' : url.pathname}`;
    url.pathname = newPath;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, API routes, and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
