import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
	const token = request.cookies.get('auth-token')?.value
	const { pathname } = request.nextUrl

	// Rutas que requieren autenticación
	const protectedRoutes = ['/dashboard', '/projects', '/tasks']

	// Rutas de autenticación
	const authRoutes = ['/login', '/register']

	// Verificar si la ruta requiere autenticación
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route),
	)

	const isAuthRoute = authRoutes.includes(pathname)

	// Si es una ruta protegida y no hay token, redirigir a login
	if (isProtectedRoute && !token) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	// Si hay token, verificarlo
	if (token) {
		try {
			jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')

			// Si el usuario está autenticado y trata de acceder a rutas de auth, redirigir a dashboard
			if (isAuthRoute) {
				return NextResponse.redirect(new URL('/dashboard', request.url))
			}
		} catch (error) {
			// Token inválido, eliminar cookie y redirigir a login si es ruta protegida
			const response = isProtectedRoute
				? NextResponse.redirect(new URL('/login', request.url))
				: NextResponse.next()

			response.cookies.delete('auth-token')
			return response
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		'/dashboard/:path*',
		'/projects/:path*',
		'/tasks/:path*',
		'/login',
		'/register',
	],
}
