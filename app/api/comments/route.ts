import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { TaskCommentSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const body = await request.json()
		const validatedData = TaskCommentSchema.parse(body)

		// Check if user has access to the task
		const task = await db.task.findFirst({
			where: {
				id: validatedData.taskId,
				project: {
					OR: [
						{ ownerId: session.user.id },
						{
							members: {
								some: {
									userId: session.user.id,
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

		const comment = await db.taskComment.create({
			data: {
				...validatedData,
				userId: session.user.id,
			},
			include: {
				user: true,
			},
		})

		return NextResponse.json(comment, { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.message },
				{ status: 422 },
			)
		}

		console.error('Error creating comment:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
