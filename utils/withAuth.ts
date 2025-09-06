import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasPermission } from '@/lib/authorization'

interface AuthOptions {
	requireAuth?: boolean
	permissions?: string[]
	roles?: string[]
}

export function withAuth(
	handler: (req: NextRequest, context: any) => Promise<NextResponse>,
	options: AuthOptions = { requireAuth: true },
) {
	return async (req: NextRequest, context: any) => {
		try {
			if (options.requireAuth) {
				const user = await getCurrentUser()

				if (!user) {
					return NextResponse.json(
						{ error: 'Authentication required' },
						{ status: 401 },
					)
				}

				// Check permissions if specified
				if (options.permissions) {
					const hasRequiredPermission = await Promise.all(
						options.permissions.map((permission) =>
							hasPermission(user.id, permission),
						),
					)

					if (!hasRequiredPermission.every(Boolean)) {
						return NextResponse.json(
							{ error: 'Insufficient permissions' },
							{ status: 403 },
						)
					}
				}

				// Check roles if specified
				if (options.roles && !options.roles.includes(user.role?.name || '')) {
					return NextResponse.json(
						{ error: 'Insufficient role permissions' },
						{ status: 403 },
					)
				}

				// Add user to context
				context.user = user
			}

			return await handler(req, context)
		} catch (error) {
			console.error('Auth middleware error:', error)
			return NextResponse.json(
				{ error: 'Internal server error' },
				{ status: 500 },
			)
		}
	}
}
