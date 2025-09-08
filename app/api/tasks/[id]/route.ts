import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { taskSchema } from '@/lib/validation'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { JWTPayload } from '@/types'

interface Context {
	params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const { id } = await params

		const task = await db.task.findFirst({
			where: {
				id,
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
			include: {
				assignee: true,
				project: true,
				comments: {
					include: {
						user: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
				attachments: {},
				_count: {
					select: {
						comments: true,
						attachments: true,
					},
				},
			},
		})

		if (!task) {
			return NextResponse.json(
				{ error: 'Tarea no encontrada' },
				{ status: 404 },
			)
		}

		return NextResponse.json(task)
	} catch (error) {
		console.error('Error fetching task:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}

export async function PUT(request: NextRequest, { params }: Context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const body = await request.json()
		const validatedData = taskSchema.partial().parse(body)

		const { id } = await params

		// Check permissions
		const existingTask = await db.task.findFirst({
			where: {
				id,
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

		if (!existingTask) {
			return NextResponse.json(
				{ error: 'Tarea no encontrada o sin permisos' },
				{ status: 404 },
			)
		}

		const updatedTask = await db.task.update({
			where: { id },
			data: validatedData,
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
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.message },
				{ status: 422 },
			)
		}

		console.error('Error updating task:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}

export async function PATCH(request: NextRequest, { params }: Context) {
	try {
		const token = request.cookies.get('auth-token')?.value

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'fallback-secret',
		) as JWTPayload
		const userId = decoded.userId
		const userRole = decoded.role

		const { id } = await params
		const updateData = await request.json()

		// Verificar que la tarea existe y el usuario tiene acceso
		const existingTask = await db.task.findFirst({
			where: {
				id,
				project: {
					company: {
						users: {
							some: {
								id: userId,
							},
						},
					},
				},
			},
			include: {
				project: {
					include: {
						members: {
							where: {
								userId,
							},
						},
					},
				},
			},
		})

		if (!existingTask) {
			return NextResponse.json(
				{ error: 'Tarea no encontrada' },
				{ status: 404 },
			)
		}

		// Verificar permisos para cambio de estado
		if (updateData.status && updateData.status !== existingTask.status) {
			const canChangeStatus =
				userRole === 'ADMIN' ||
				existingTask.project.members.some((member) => member.userId === userId)

			if (!canChangeStatus) {
				return NextResponse.json(
					{
						error: 'No tienes permisos para cambiar el estado de esta tarea',
					},
					{ status: 403 },
				)
			}
		}

		const updatedTask = await db.task.update({
			where: { id },
			data: {
				...updateData,
				...(updateData.dueDate && { dueDate: new Date(updateData.dueDate) }),
			},
			include: {
				assignee: {
					select: {
						id: true,
						name: true,
					},
				},
				project: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		})

		return NextResponse.json({ task: updatedTask })
	} catch (error) {
		console.error('Error updating task:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}

export async function DELETE(request: NextRequest, { params }: Context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const { id } = await params

		// Check permissions
		const task = await db.task.findFirst({
			where: {
				id,
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

		await db.task.delete({
			where: { id },
		})

		return NextResponse.json({ message: 'Tarea eliminada correctamente' })
	} catch (error) {
		console.error('Error deleting task:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
