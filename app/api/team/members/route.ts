import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { randomBytes } from 'crypto'

export async function GET() {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const members = await db.teamMember.findMany({
			where: {
				companyId: session.user.companyId,
			},
			include: {
				user: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		const formattedMembers = members.map((member) => ({
			...member.user,
			role: member.role,
			createdAt: member.createdAt,
		}))

		return NextResponse.json(formattedMembers)
	} catch (error) {
		console.error('Error fetching team members:', error)
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

		// Check if user is admin
		const member = await db.teamMember.findFirst({
			where: {
				userId: session.user.id,
				companyId: session.user.companyId,
				role: 'ADMIN',
			},
		})

		if (!member) {
			return NextResponse.json(
				{ error: 'Sin permisos de administrador' },
				{ status: 403 },
			)
		}

		const body = await request.json()
		const validatedData = memberInviteSchema.parse(body)

		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email: validatedData.email },
		})

		if (existingUser) {
			// Check if already a member
			const existingMember = await db.teamMember.findFirst({
				where: {
					userId: existingUser.id,
					companyId: session.user.companyId,
				},
			})

			if (existingMember) {
				return NextResponse.json(
					{ error: 'El usuario ya es miembro del equipo' },
					{ status: 422 },
				)
			}
		}

		// Create invitation
		const invitation = await db.teamMember.create({
			data: {
				role: validatedData.role,
				token: randomBytes(32).toString('hex'),
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
				companyId: session.user.companyId,
				invitedById: session.user.id,
			},
		})

		// TODO: Send invitation email

		return NextResponse.json(invitation, { status: 201 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.message },
				{ status: 422 },
			)
		}

		console.error('Error inviting member:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
