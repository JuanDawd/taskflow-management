import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validation'
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

		const project = await prisma.project.findFirst({
			where: {
				id: params.id,
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

		// Check if user has permission to edit project
		const existingProject = await prisma.project.findFirst({
			where: {
				id: params.id,
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
		const validatedData = projectSchema.parse(body)

		// Update project
		const updatedProject = await prisma.project.update({
			where: { id: params.id },
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
			await prisma.projectMember.deleteMany({
				where: { projectId: params.id },
			})

			// Add new members
			if (body.memberIds.length > 0) {
				await prisma.projectMember.createMany({
					data: body.memberIds.map((userId: string) => ({
						projectId: params.id,
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
				{ error: 'Datos inválidos', details: error.errors },
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

		// Check admin permissions
		const adminMember = await prisma.teamMember.findFirst({
			where: {
				userId: session.user.id,
				companyId: session.user.companyId,
				role: 'ADMIN',
			},
		})

		if (!adminMember) {
			return NextResponse.json(
				{ error: 'Sin permisos de administrador' },
				{ status: 403 },
			)
		}

		// Cannot delete yourself
		const memberToDelete = await prisma.teamMember.findUnique({
			where: { id: params.id },
		})

		if (memberToDelete?.userId === session.user.id) {
			return NextResponse.json(
				{ error: 'No puedes eliminarte a ti mismo' },
				{ status: 422 },
			)
		}

		// Delete member and all related data
		await prisma.teamMember.delete({
			where: { id: params.id },
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
