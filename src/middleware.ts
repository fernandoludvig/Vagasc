import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { nextUrl } = request
  const pathname = nextUrl.pathname

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/',
    '/search',
    '/spaces',
    '/api/spaces/search',
    '/api/auth',
    '/login',
    '/register'
  ]

  // Rotas de API que são públicas
  const publicApiRoutes = [
    '/api/spaces/search',
    '/api/auth',
    '/api/stripe/webhook'
  ]

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  // Permitir todas as rotas públicas
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Para rotas de autenticação, redirecionar se já logado
  if (isAuthRoute) {
    // Verificar se há token de sessão (simplificado)
    const token = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token')
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  // Para outras rotas, verificar autenticação
  const token = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
