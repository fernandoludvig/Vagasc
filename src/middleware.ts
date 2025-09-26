import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isApiDebugRoute = nextUrl.pathname.includes('/debug') || nextUrl.pathname.includes('/test')
  const isApiPublicRoute = nextUrl.pathname.startsWith('/api/spaces/search')
  const isPublicRoute = ['/', '/search', '/space'].includes(nextUrl.pathname)
  const isAuthRoute = ['/login', '/register'].includes(nextUrl.pathname)

  if (isApiAuthRoute || isApiDebugRoute || isApiPublicRoute) {
    return NextResponse.next()
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
