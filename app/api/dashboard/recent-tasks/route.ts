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
		const companyId = token.companyId

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
