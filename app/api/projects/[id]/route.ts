import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { UpdateProjectSchema } from '@/lib/validation'

type Context = {
	params: Promise<{ id: string }>
}
export async function GET(request: Request, { params }: Context) {
	try {
		const data = await params
		const id = data.id

		console.log(data, id)

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const project = await db.project.findFirst({
			where: {
				AND: [
					{ OR: [{ id }, { slug: id }] },
					{ companyId: session.user.company.id },
					{
						OR: [{ members: { some: { userId: session.user.id } } }],
					},
				],
			},
			include: {
				members: {
					include: {
						user: true,
					},
				},
				tasks: {
					include: {
						assignee: true,
						_count: {
							select: {
								comments: true,
								attachments: true,
							},
						},
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

		if (!project) {
			return NextResponse.json(
				{ error: 'Proyecto no encontrado' },
				{ status: 404 },
			)
		}

		const formattedProject = {
			...project,
			members: project.members.map((member) => member.user),
		}

		return NextResponse.json(formattedProject)
	} catch (error) {
		console.error('Error fetching project:', error)
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

		const { id } = await params

		// Check if user has permission to edit project
		const existingProject = await db.project.findFirst({
			where: {
				id,
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

		if (!existingProject) {
			return NextResponse.json(
				{ error: 'Proyecto no encontrado o sin permisos' },
				{ status: 404 },
			)
		}

		const body = await request.json()
		const validatedData = UpdateProjectSchema.parse(body)

		// Update project
		const updatedProject = await db.project.update({
			where: { id },
			data: validatedData,
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

		// Update members if provided
		if (body.memberIds) {
			// Remove existing members
			await db.projectMember.deleteMany({
				where: { projectId: id },
			})

			// Add new members
			if (body.memberIds.length > 0) {
				await db.projectMember.createMany({
					data: body.memberIds.map((userId: string) => ({
						projectId: id,
						userId,
						role: 'MEMBER',
					})),
				})
			}
		}

		const formattedProject = {
			...updatedProject,
			members: updatedProject.members.map((member) => member.user),
		}

		return NextResponse.json(formattedProject)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.message },
				{ status: 422 },
			)
		}

		console.error('Error updating project:', error)
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

		// Check if user owns this specific project
		const project = await db.project.findFirst({
			where: {
				id,
				ownerId: session.user.id,
				companyId: session.user.company.id,
			},
		})

		if (!project) {
			return NextResponse.json(
				{ error: 'Proyecto no encontrado o sin permisos' },
				{ status: 404 },
			)
		}

		// Delete project (members will cascade delete if configured)
		await db.project.delete({
			where: { id },
		})

		return NextResponse.json({ message: 'Miembro eliminado correctamente' })
	} catch (error) {
		console.error('Error deleting member:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
