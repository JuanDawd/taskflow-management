import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { CreateProjectSchema } from '@/lib/validation'

export async function GET() {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const projects = await db.project.findMany({
			where: {
				OR: [
					{ companyId: session.user.companyId },
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
		const validatedData = CreateProjectSchema.parse(body)

		const project = await db.project.create({
			data: {
				...validatedData,
				ownerId: session.user.id,
				companyId: session.user.company.id,
				// members: body.memberIds
				// 	? {
				// 			create: body.memberIds.map((userId: string) => ({
				// 				userId,
				// 				role: 'MEMBER',
				// 			})),
				// 	  }
				// 	: undefined,
			},
			include: {
				// members: {
				// 	include: {
				// 		user: true,
				// 	},
				// },
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
			// members: project.members.map((member) => member.user),
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
