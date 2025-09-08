import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { taskSchema } from '@/lib/validation'
import { z } from 'zod'

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const projectId = searchParams.get('projectId')
		const assigneeId = searchParams.get('assigneeId')
		const search = searchParams.get('search')

		const tasks = await db.task.findMany({
			where: {
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
				...(projectId && { projectId }),

				...(assigneeId && { assigneeId }),
				...(search && {
					OR: [
						{ title: { contains: search, mode: 'insensitive' } },
						{ description: { contains: search, mode: 'insensitive' } },
					],
				}),
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
			orderBy: {
				dueDate: 'asc',
			},
		})

		return NextResponse.json(tasks)
	} catch (error) {
		console.error('Error fetching tasks:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const body = await request.json()
		const validatedData = taskSchema.parse(body)

		// Check if user has access to the project
		const project = await db.project.findFirst({
			where: {
				id: validatedData.projectId,
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
		})

		if (!project) {
			return NextResponse.json(
				{ error: 'Proyecto no encontrado o sin permisos' },
				{ status: 404 },
			)
		}

		const task = await db.task.create({
			data: {
				...validatedData,
				createdById: session.user.id,
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

		return NextResponse.json(task, { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.message },
				{ status: 422 },
			)
		}

		console.error('Error creating task:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
