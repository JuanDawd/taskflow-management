import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { companySchema } from '@/lib/validation'
import { z } from 'zod'

export async function GET() {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
		}

		const company = await db.company.findUnique({
			where: { id: session.user.companyId },
			include: {
				_count: {
					select: {
						members: true,
						projects: true,
					},
				},
			},
		})

		if (!company) {
			return NextResponse.json(
				{ error: 'Empresa no encontrada' },
				{ status: 404 },
			)
		}

		return NextResponse.json(company)
	} catch (error) {
		console.error('Error fetching company:', error)
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

		// Check admin permissions
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
		const validatedData = companySchema.parse(body)

		const updatedCompany = await db.company.update({
			where: { id: session.user.companyId },
			data: validatedData,
		})

		return NextResponse.json(updatedCompany)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Datos inválidos', details: error.message },
				{ status: 422 },
			)
		}

		console.error('Error updating company:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
