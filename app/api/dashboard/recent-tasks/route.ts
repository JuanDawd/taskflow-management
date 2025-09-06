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
		const companyId = decoded.companyId

		const tasks = await db.task.findMany({
			where: {
				project: {
					companyId,
				},
			},
			include: {
				assignee: {
					select: {
						name: true,
					},
				},
				project: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				updatedAt: 'desc',
			},
			take: 10,
		})

		return NextResponse.json({ tasks })
	} catch (error) {
		console.error('Error fetching recent tasks:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
