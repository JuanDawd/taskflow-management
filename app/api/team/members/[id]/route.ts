import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { UpdateTeamMemberSchema } from '@/lib/validation'

interface Context {
	params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Context) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const { id } = await params

		// Get member details with projects
		const member = await db.teamMember.findFirst({
			where: {
				id,
				companyId: session.user.companyId, // Ensure same company
			},
			include: {
				user: true,
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
			...member.user,
			id: member.id,
			role: member.role,
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
		const validatedData = UpdateTeamMemberSchema.parse(body)
		const { role } = validatedData

		// Check if user is admin
		const adminMember = await db.teamMember.findFirst({
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

		const { id } = await params

		// Get the member to update
		const existingMember = await db.teamMember.findFirst({
			where: {
				id,
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
			const adminCount = await db.teamMember.count({
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
		await db.$transaction(async (tx) => {
			// Update member role if provided
			let updatedMember = existingMember
			if (role && role !== existingMember.role) {
				updatedMember = await tx.teamMember.update({
					where: {
						id,
					},
					data: {
						role,
					},
					include: {
						user: true,
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
				}
			}

			return updatedMember
		})

		// Get updated member with projects
		const memberWithProjects = await db.teamMember.findUnique({
			where: { id },
			include: {
				user: true,
			},
		})

		const formattedMember = {
			id: memberWithProjects!.id,
			role: memberWithProjects!.role,
		}

		return NextResponse.json(formattedMember)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.message },
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
		const adminMember = await db.teamMember.findFirst({
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

		const { id } = await params

		// Get the member to delete
		const memberToDelete = await db.teamMember.findFirst({
			where: {
				id,
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
			const adminCount = await db.teamMember.count({
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
		const activeTasks = await db.task.count({
			where: {
				assigneeId: memberToDelete.userId,
				status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] },
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
		await db.$transaction(async (tx) => {
			// Remove from all projects
			await tx.projectMember.deleteMany({
				where: {
					userId: memberToDelete.userId,
				},
			})

			// Remove team membership
			await tx.teamMember.delete({
				where: {
					id,
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
