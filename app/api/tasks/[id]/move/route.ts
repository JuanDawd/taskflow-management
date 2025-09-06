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

		const body = await request.json()
		const { status, position } = body

		const { id } = await params

		// Check permissions
		const task = await db.task.findFirst({
			where: {
				id: id,
				project: {
					OR: [
						{ ownerId: session.user.id },
						{
							members: {
								some: {
									userId: session.user.id,
									role: { in: ['ADMIN', 'MEMBER'] },
								},
							},
						},
					],
				},
			},
		})

		if (!task) {
			return NextResponse.json(
				{ error: 'Tarea no encontrada o sin permisos' },
				{ status: 404 },
			)
		}

		// Update task status and position
		const updatedTask = await db.task.update({
			where: { id },
			data: {
				status,
				position: position || 0,
			},
			include: {
				assignee: true,
				project: true,
				_count: {
					select: {
						comments: true,
						attachments: true,
					},
				},
			},
		})

		return NextResponse.json(updatedTask)
	} catch (error) {
		console.error('Error moving task:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
