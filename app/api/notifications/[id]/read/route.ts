import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Context {
	params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}
		const { id } = await params

		await db.notification.updateMany({
			where: {
				id,
				userId: session.user.id,
			},
			data: {
				read: true,
			},
		})

		return NextResponse.json({ message: 'Notificación marcada como leída' })
	} catch (error) {
		console.error('Error marking notification as read:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
