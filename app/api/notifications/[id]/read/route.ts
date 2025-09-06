import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Context {
	params: { id: string }
}

export async function POST(request: NextRequest, { params }: Context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		await prisma.notification.updateMany({
			where: {
				id: params.id,
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
