import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminAuthenticated = request.cookies.get('isAdminAuthenticated')?.value === 'true';

  // Define paths that do NOT require authentication
  const publicPaths = ['/login', '/order/today'];

  // Check if the requested path is an admin path and requires authentication
  const isAdminPath = !publicPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isAdminPath && !isAdminAuthenticated) {
    // Redirect to login page if not authenticated and accessing an admin path
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed if authenticated or accessing a public path
  return NextResponse.next();
}

// Configure the middleware to run on all paths except API routes, static files, and the _next directory
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)?'],
}; 