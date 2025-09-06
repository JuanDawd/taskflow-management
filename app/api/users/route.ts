import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'fallback-secret',
		) as any
		const companyId = decoded.companyId

		const users = await db.user.findMany({
			where: {
				companyId,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				avatar: true,
			},
			orderBy: {
				name: 'asc',
			},
		})

		return NextResponse.json({ users })
	} catch (error) {
		console.error('Error fetching users:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
