import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { projectSchema } from '@/lib/validation'
import { z } from 'zod'

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const status = searchParams.get('status')
		const priority = searchParams.get('priority')

		const projects = await db.project.findMany({
			where: {
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
				...(status && { status: status as any }),
				...(priority && { priority: priority as any }),
			},
			include: {
				members: {
					include: {
						user: true,
					},
				},
				_count: {
					select: {
						tasks: true,
						members: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		const formattedProjects = projects.map((project) => ({
			...project,
			members: project.members.map((member) => member.user),
		}))

		return NextResponse.json(formattedProjects)
	} catch (error) {
		console.error('Error fetching projects:', error)
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
		const validatedData = projectSchema.parse(body)

		const project = await db.project.create({
			data: {
				...validatedData,
				ownerId: session.user.id,
				companyId: session.user.companyId, // Assuming user has companyId
				members: body.memberIds
					? {
							create: body.memberIds.map((userId: string) => ({
								userId,
								role: 'MEMBER',
							})),
					  }
					: undefined,
			},
			include: {
				members: {
					include: {
						user: true,
					},
				},
				_count: {
					select: {
						tasks: true,
						members: true,
					},
				},
			},
		})

		const formattedProject = {
			...project,
			members: project.members.map((member) => member.user),
		}

		return NextResponse.json(formattedProject, { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.message },
				{ status: 422 },
			)
		}

		console.error('Error creating project:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
