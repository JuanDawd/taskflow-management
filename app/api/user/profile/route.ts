import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { UpdateUserSchema } from '@/lib/validation'
export async function GET() {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const user = await db.user.findUnique({
			where: { id: session.user.id },
			include: {
				teamMember: true,
			},
		})

		if (!user) {
			return NextResponse.json(
				{ error: 'Usuario no encontrado' },
				{ status: 404 },
			)
		}

		return NextResponse.json({
			...user,
			role: user.teamMember?.role,
		})
	} catch (error) {
		console.error('Error fetching user profile:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}

export async function PUT(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const body = await request.json()
		const validatedData = UpdateUserSchema.parse(body)

		const updatedUser = await db.user.update({
			where: { id: session.user.id },
			data: validatedData,
		})

		return NextResponse.json(updatedUser)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.message },
				{ status: 422 },
			)
		}

		console.error('Error updating user profile:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
