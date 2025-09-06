import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { JWTPayload } from '@/types'

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'fallback-secret',
		) as JWTPayload

		const user = await db.user.findUnique({
			where: { id: decoded.userId },
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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
	}
}
