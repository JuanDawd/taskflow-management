import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
	function middleware(req) {
		const token = req.nextauth.token
		const isAuth = !!token
		const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
		const isApiRoute = req.nextUrl.pathname.startsWith('/api')

		// Redirect to login if not authenticated and trying to access protected routes
		if (!isAuth && !isAuthPage && !isApiRoute) {
			return NextResponse.redirect(new URL('/auth/signin', req.url))
		}

		// Redirect to dashboard if authenticated and trying to access auth pages
		if (isAuth && isAuthPage) {
			return NextResponse.redirect(new URL('/dashboard', req.url))
		}

		// Check API routes authorization
		if (isApiRoute && !isAuthPage) {
			// Allow public API routes
			const publicRoutes = ['/api/auth', '/api/health']
			const isPublicRoute = publicRoutes.some((route) =>
				req.nextUrl.pathname.startsWith(route),
			)

			if (!isPublicRoute && !isAuth) {
				return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
			}
		}

		return NextResponse.next()
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				// Allow access to auth pages without token
				if (req.nextUrl.pathname.startsWith('/auth')) {
					return true
				}
				// Require token for all other pages
				return !!token
			},
		},
	},
)

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		'/((?!_next/static|_next/image|favicon.ico|public).*)',
	],
}
