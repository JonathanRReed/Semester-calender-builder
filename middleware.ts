import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect only the site root to the basePath
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/calendar-builder'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Note: match root only; do not include basePath in matcher
export const config = {
  matcher: ['/'],
}
