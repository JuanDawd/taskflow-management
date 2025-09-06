import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
		const status = searchParams.get('status')
		const assigneeId = searchParams.get('assigneeId')
		const priority = searchParams.get('priority')
		const search = searchParams.get('search')

		const tasks = await prisma.task.findMany({
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
				...(status && { status: status as any }),
				...(assigneeId && { assigneeId }),
				...(priority && { priority: priority as any }),
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
				position: 'asc',
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
		const project = await prisma.project.findFirst({
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

		// Get the highest position for the status
		const lastTask = await prisma.task.findFirst({
			where: {
				projectId: validatedData.projectId,
				status: validatedData.status,
			},
			orderBy: {
				position: 'desc',
			},
		})

		const position = lastTask ? lastTask.position + 1 : 0

		const task = await prisma.task.create({
			data: {
				...validatedData,
				position,
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
				{ error: 'Datos inválidos', details: error.errors },
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
