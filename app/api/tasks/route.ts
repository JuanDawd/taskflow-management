import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'fallback-secret',
		) as any
		const companyId = decoded.companyId

		const { searchParams } = new URL(request.url)
		const projectId = searchParams.get('projectId')

		const whereClause = {
			project: {
				companyId,
				...(projectId && { id: projectId }),
			},
		}

		const tasks = await db.task.findMany({
			where: whereClause,
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
				createdBy: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return NextResponse.json({ tasks })
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
		const token = request.cookies.get('auth-token')?.value

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'fallback-secret',
		) as any
		const userId = decoded.userId

		const { title, description, projectId, assigneeId, priority, dueDate } =
			await request.json()

		// Verificar que el proyecto pertenece a la empresa del usuario
		const project = await db.project.findFirst({
			where: {
				id: projectId,
				company: {
					users: {
						some: {
							id: userId,
						},
					},
				},
			},
		})

		if (!project) {
			return NextResponse.json(
				{ error: 'Proyecto no encontrado' },
				{ status: 404 },
			)
		}

		const task = await db.task.create({
			data: {
				title,
				description,
				projectId,
				assigneeId,
				priority,
				dueDate: dueDate ? new Date(dueDate) : null,
				createdById: userId,
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

		return NextResponse.json({ task })
	} catch (error) {
		console.error('Error creating task:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
