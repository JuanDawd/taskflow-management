import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
	function middleware(req) {
		const token = req.nextauth.token
		const isAuth = !!token
		const isAuthPage =
			req.nextUrl.pathname.startsWith('/login') ||
			req.nextUrl.pathname.startsWith('/register') // Update this line
		const isApiRoute = req.nextUrl.pathname.startsWith('/api')
		const isRootPath = req.nextUrl.pathname === '/'

		// Handle root path - redirect to appropriate page based on auth status
		if (isRootPath) {
			if (isAuth) {
				return NextResponse.redirect(new URL('/dashboard', req.url))
			} else {
				return NextResponse.next() // Allow access to home page for unauthenticated users
			}
		}

		// Redirect to login if not authenticated and trying to access protected routes
		if (!isAuth && !isAuthPage && !isApiRoute) {
			return NextResponse.redirect(new URL('/login', req.url)) // Update this line
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
				return NextResponse.next()
			}
		}

		return NextResponse.next()
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				// Allow access to auth pages and root path without token
				if (
					req.nextUrl.pathname.startsWith('/login') ||
					req.nextUrl.pathname.startsWith('/register') ||
					req.nextUrl.pathname === '/'
				) {
					// Update this condition
					return true
				}
				// Require token for all other pages
				return !!token
			},
		},
	},
)

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
