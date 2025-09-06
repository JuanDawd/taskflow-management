import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface Context {
	params: { id: string }
}

// Validation schema for member update
const updateMemberSchema = z.object({
	role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional(),
	projectIds: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest, { params }: Context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		// Get member details with projects
		const member = await prisma.teamMember.findFirst({
			where: {
				id: params.id,
				companyId: session.user.companyId, // Ensure same company
			},
			include: {
				user: true,
				projects: {
					include: {
						project: {
							select: {
								id: true,
								name: true,
								description: true,
								status: true,
							},
						},
					},
				},
			},
		})

		if (!member) {
			return NextResponse.json(
				{ error: 'Miembro no encontrado' },
				{ status: 404 },
			)
		}

		// Format response
		const formattedMember = {
			id: member.id,
			...member.user,
			role: member.role,
			joinedAt: member.joinedAt,
			projects: member.projects.map((p) => p.project),
		}

		return NextResponse.json(formattedMember)
	} catch (error) {
		console.error('Error fetching member:', error)
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

		// Validate request body
		const body = await request.json()
		const validatedData = updateMemberSchema.parse(body)
		const { role, projectIds } = validatedData

		// Check if user is admin
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

		// Get the member to update
		const existingMember = await prisma.teamMember.findFirst({
			where: {
				id: params.id,
				companyId: session.user.companyId,
			},
			include: {
				user: true,
			},
		})

		if (!existingMember) {
			return NextResponse.json(
				{ error: 'Miembro no encontrado' },
				{ status: 404 },
			)
		}

		// Prevent self-role modification if demoting from admin
		if (existingMember.userId === session.user.id && role && role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'No puedes modificar tu propio rol de administrador' },
				{ status: 422 },
			)
		}

		// Ensure at least one admin remains
		if (role && role !== 'ADMIN' && existingMember.role === 'ADMIN') {
			const adminCount = await prisma.teamMember.count({
				where: {
					companyId: session.user.companyId,
					role: 'ADMIN',
				},
			})

			if (adminCount <= 1) {
				return NextResponse.json(
					{ error: 'Debe haber al menos un administrador en el equipo' },
					{ status: 422 },
				)
			}
		}

		// Start transaction for atomic updates
		const result = await prisma.$transaction(async (tx) => {
			// Update member role if provided
			let updatedMember = existingMember
			if (role && role !== existingMember.role) {
				updatedMember = await tx.teamMember.update({
					where: {
						id: params.id,
					},
					data: {
						role,
					},
					include: {
						user: true,
					},
				})

				// Create notification for role change
				await tx.notification.create({
					data: {
						type: 'MEMBER_UPDATED',
						title: 'Rol actualizado',
						message: `Tu rol ha sido cambiado a ${role}`,
						userId: updatedMember.userId,
					},
				})
			}

			// Update project assignments if provided
			if (projectIds !== undefined) {
				// Remove existing project assignments
				await tx.projectMember.deleteMany({
					where: {
						userId: updatedMember.userId,
					},
				})

				// Add new project assignments
				if (projectIds.length > 0) {
					// Validate projects belong to the same company
					const validProjects = await tx.project.findMany({
						where: {
							id: { in: projectIds },
							companyId: session.user.companyId,
						},
					})

					if (validProjects.length !== projectIds.length) {
						throw new Error('Algunos proyectos no son válidos')
					}

					await tx.projectMember.createMany({
						data: projectIds.map((projectId: string) => ({
							projectId,
							userId: updatedMember.userId,
							role: 'MEMBER',
						})),
					})

					// Create notifications for project assignments
					if (projectIds.length > 0) {
						await tx.notification.create({
							data: {
								type: 'MEMBER_ADDED',
								title: 'Asignado a proyectos',
								message: `Has sido asignado a ${projectIds.length} proyecto(s)`,
								userId: updatedMember.userId,
							},
						})
					}
				}
			}

			return updatedMember
		})

		// Get updated member with projects
		const memberWithProjects = await prisma.teamMember.findUnique({
			where: { id: params.id },
			include: {
				user: true,
				projects: {
					include: {
						project: {
							select: {
								id: true,
								name: true,
								description: true,
								status: true,
							},
						},
					},
				},
			},
		})

		const formattedMember = {
			id: memberWithProjects!.id,
			...memberWithProjects!.user,
			role: memberWithProjects!.role,
			joinedAt: memberWithProjects!.joinedAt,
			projects: memberWithProjects!.projects.map((p) => p.project),
		}

		return NextResponse.json(formattedMember)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.errors },
				{ status: 422 },
			)
		}

		console.error('Error updating member:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : 'Error interno del servidor',
			},
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

		// Get the member to delete
		const memberToDelete = await prisma.teamMember.findFirst({
			where: {
				id: params.id,
				companyId: session.user.companyId,
			},
			include: {
				user: true,
			},
		})

		if (!memberToDelete) {
			return NextResponse.json(
				{ error: 'Miembro no encontrado' },
				{ status: 404 },
			)
		}

		// Prevent self-deletion
		if (memberToDelete.userId === session.user.id) {
			return NextResponse.json(
				{ error: 'No puedes eliminarte a ti mismo del equipo' },
				{ status: 422 },
			)
		}

		// Ensure at least one admin remains
		if (memberToDelete.role === 'ADMIN') {
			const adminCount = await prisma.teamMember.count({
				where: {
					companyId: session.user.companyId,
					role: 'ADMIN',
				},
			})

			if (adminCount <= 1) {
				return NextResponse.json(
					{ error: 'No se puede eliminar el último administrador del equipo' },
					{ status: 422 },
				)
			}
		}

		// Check if member has active tasks
		const activeTasks = await prisma.task.count({
			where: {
				assigneeId: memberToDelete.userId,
				status: { in: ['TODO', 'IN_PROGRESS', 'REVIEW'] },
			},
		})

		if (activeTasks > 0) {
			return NextResponse.json(
				{
					error: `El miembro tiene ${activeTasks} tarea(s) activa(s). Reasigna las tareas antes de eliminar.`,
					activeTasks,
				},
				{ status: 422 },
			)
		}

		// Start transaction for atomic deletion
		await prisma.$transaction(async (tx) => {
			// Remove from all projects
			await tx.projectMember.deleteMany({
				where: {
					userId: memberToDelete.userId,
				},
			})

			// Remove team membership
			await tx.teamMember.delete({
				where: {
					id: params.id,
				},
			})

			// Create notification for the removed user
			await tx.notification.create({
				data: {
					type: 'MEMBER_REMOVED',
					title: 'Removido del equipo',
					message: 'Has sido removido del equipo',
					userId: memberToDelete.userId,
				},
			})

			// Update task assignments to null (unassign)
			await tx.task.updateMany({
				where: {
					assigneeId: memberToDelete.userId,
				},
				data: {
					assigneeId: null,
				},
			})

			// Log the action
			console.log(
				`Member ${memberToDelete.user.email} removed from company ${session.user.companyId} by ${session.user.email}`,
			)
		})

		return NextResponse.json({
			message: 'Miembro eliminado correctamente',
			removedMember: {
				id: memberToDelete.id,
				name: memberToDelete.user.name,
				email: memberToDelete.user.email,
			},
		})
	} catch (error) {
		console.error('Error deleting member:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
