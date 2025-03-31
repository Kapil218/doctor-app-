import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')

  // If no tokens and trying to access protected route
  if ((!accessToken || !refreshToken) && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If has tokens and trying to access auth pages
  if (accessToken && refreshToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 