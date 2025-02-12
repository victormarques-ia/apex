import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('payload-token')

  const protectedRoutes = new Set(['/', '/home'])
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth/sign-in')

  if (!token && protectedRoutes.has(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  return NextResponse.next()
}

// Apply the middleware to these paths
export const config = {
  matcher: ['/', '/home', '/auth/sign-in'],
}
