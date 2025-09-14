import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					const response = await fetch(
						`${process.env.NEXTAUTH_URL}/api/auth/login`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								email: credentials.email,
								password: credentials.password,
							}),
						},
					)

					if (response.ok) {
						const data = await response.json()

						return {
							id: data.user.id,
							name: data.user.name,
							email: data.user.email,
							role: data.user.role,
							company: {
								id: data.user.company.id,
								name: data.user.company.name,
								slug: data.user.company.slug,
							},
						}
					}
					return null
				} catch (error) {
					console.error('Auth error:', error)
					return null
				}
			},
		}),
	],
	pages: {
		signIn: '/login',
	},
	callbacks: {
		async jwt({ token, user }) {
			// Persist user data to the token right after signin
			if (user) {
				token.id = user.id
				token.role = user.role
				token.company = user.company
			}
			return token
		},
		async session({ session, token }) {
			// Send properties to the client
			session.user.id = token.id
			session.user.role = token.role
			session.user.company = token.company
			return session
		},
	},
	session: {
		strategy: 'jwt',
	},
})

export { handler as GET, handler as POST }
