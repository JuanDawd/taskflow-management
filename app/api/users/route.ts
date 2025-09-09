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
