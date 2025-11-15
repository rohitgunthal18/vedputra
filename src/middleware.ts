import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  let needsRedirect = false;
  
  // Force HTTPS redirect
  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    needsRedirect = true;
  }
  
  // Force www redirect (only for vedputra.store domain)
  if (hostname === 'vedputra.store') {
    url.hostname = 'www.vedputra.store';
    needsRedirect = true;
  }
  
  // If any redirect is needed, perform it
  if (needsRedirect) {
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();

  // Set CSP header for all routes
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://zaqzyfiiapihjiexplqs.supabase.co https://sdk.cashfree.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://zaqzyfiiapihjiexplqs.supabase.co https://*.supabase.co https://api.postalpincode.in https://api.cashfree.com https://sandbox.cashfree.com https://sdk.cashfree.com",
    "worker-src 'self' blob:",
    "frame-src 'self' https://sdk.cashfree.com https://cashfree.com",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


