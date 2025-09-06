// auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}
				try {
					const user = await db.user.findUnique({
						where: {
							email: credentials.email,
						},
						include: {
							company: true,
						},
					})

					if (!user) {
						return null
					}

					const isPasswordValid = await bcrypt.compare(
						credentials.password,
						user.password,
					)

					if (!isPasswordValid) {
						return null
					}

					return {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
						companyId: user.companyId,
						company: user.company,
					}
				} catch (error) {
					console.error('Auth error:', error)
					return null
				}
			},
		}),
	],
	session: {
		strategy: 'jwt',
		maxAge: 7 * 24 * 60 * 60, // 7 días
	},
	jwt: {
		maxAge: 7 * 24 * 60 * 60, // 7 días
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.role = user.role
				token.companyId = user.companyId
				token.company = user.company
			}
			return token
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string
				session.user.role = token.role as UserRole
				session.user.companyId = token.companyId as string
				session.user.company = token.company as {
					id: string
					name: string
					slug: string
				}
			}
			return session
		},
	},
	pages: {
		signIn: '/login',
		error: '/login',
	},
	secret: process.env.NEXTAUTH_SECRET,
}

// Extended types for NextAuth
declare module 'next-auth' {
	interface User {
		id: string
		role: UserRole
		companyId: string
		company: {
			id: string
			name: string
			slug: string
		}
	}

	interface Session {
		user: {
			id: string
			email: string
			name: string
			role: UserRole
			companyId: string
			company: {
				id: string
				name: string
				slug: string
			}
		}
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string
		role: UserRole
		companyId: string
		company: {
			id: string
			name: string
			slug: string
		}
	}
}
