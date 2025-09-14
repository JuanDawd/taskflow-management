import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
	try {
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		})

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		const user = await db.user.findUnique({
			where: { id: token.id },
			include: {
				company: true,
			},
		})

		if (!user) {
			return NextResponse.json(
				{ error: 'Usuario no encontrado' },
				{ status: 404 },
			)
		}

		return NextResponse.json({
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				company: {
					id: user.company.id,
					name: user.company.name,
					slug: user.company.slug,
				},
			},
		})
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
	}
}
