import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

interface Context {
	params: Promise<{ taskId: string }>
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
		) as any
		const userId = decoded.userId
		const userRole = decoded.role

		const { taskId } = await params
		const updateData = await request.json()

		// Verificar que la tarea existe y el usuario tiene acceso
		const existingTask = await db.task.findFirst({
			where: {
				id: taskId,
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
			where: { id: taskId },
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
		const token = request.cookies.get('auth-token')?.value

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'fallback-secret',
		) as any
		const userId = decoded.userId
		const userRole = decoded.role

		const { taskId } = await params

		// Verificar que la tarea existe y el usuario tiene acceso
		const existingTask = await db.task.findFirst({
			where: {
				id: taskId,
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
		})

		if (!existingTask) {
			return NextResponse.json(
				{ error: 'Tarea no encontrada' },
				{ status: 404 },
			)
		}

		// Solo admins o el creador pueden eliminar tareas
		if (userRole !== 'ADMIN' && existingTask.createdById !== userId) {
			return NextResponse.json(
				{
					error: 'No tienes permisos para eliminar esta tarea',
				},
				{ status: 403 },
			)
		}

		await db.task.delete({
			where: { id: taskId },
		})

		return NextResponse.json({ message: 'Tarea eliminada exitosamente' })
	} catch (error) {
		console.error('Error deleting task:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
