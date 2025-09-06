import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const unreadOnly = searchParams.get('unreadOnly') === 'true'
		const limit = parseInt(searchParams.get('limit') || '50')

		const notifications = await db.notification.findMany({
			where: {
				userId: session.user.id,
				...(unreadOnly && { read: false }),
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit,
		})

		return NextResponse.json(notifications)
	} catch (error) {
		console.error('Error fetching notifications:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
