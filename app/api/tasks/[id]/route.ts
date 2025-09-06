import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { taskSchema } from '@/lib/validation'
import { z } from 'zod'

interface Context {
	params: { id: string }
}

export async function GET(request: NextRequest, { params }: Context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const task = await prisma.task.findFirst({
			where: {
				id: params.id,
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
						replies: {
							include: {
								user: true,
							},
						},
					},
					where: {
						parentId: null,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
				attachments: {
					include: {
						uploadedBy: true,
					},
				},
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

		// Check permissions
		const existingTask = await prisma.task.findFirst({
			where: {
				id: params.id,
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

		const updatedTask = await prisma.task.update({
			where: { id: params.id },
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
				{ error: 'Datos inválidos', details: error.errors },
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

export async function DELETE(request: NextRequest, { params }: Context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		// Check permissions
		const task = await prisma.task.findFirst({
			where: {
				id: params.id,
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

		await prisma.task.delete({
			where: { id: params.id },
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
