import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
	try {
		const { name, email, password, companyName, companySlug } =
			await request.json()

		// Verificar si el usuario ya existe
		const existingUser = await db.user.findUnique({
			where: { email },
		})

		if (existingUser) {
			return NextResponse.json(
				{ error: 'El usuario ya existe' },
				{ status: 400 },
			)
		}

		// Verificar si el slug de la empresa ya existe
		const existingCompany = await db.company.findUnique({
			where: { slug: companySlug },
		})

		if (existingCompany) {
			return NextResponse.json(
				{ error: 'El nombre de empresa ya está en uso' },
				{ status: 400 },
			)
		}

		// Encriptar contraseña
		const hashedPassword = await bcrypt.hash(password, 12)

		// Crear empresa y usuario en una transacción
		const result = await db.$transaction(async (tx) => {
			// Crear empresa
			const company = await tx.company.create({
				data: {
					name: companyName,
					slug: companySlug,
				},
			})

			// Crear usuario como admin
			const user = await tx.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
					role: 'ADMIN',
					companyId: company.id,
				},
			})

			return { company, user }
		})

		return NextResponse.json({
			message: 'Usuario y empresa creados exitosamente',
			user: {
				id: result.user.id,
				name: result.user.name,
				email: result.user.email,
				role: result.user.role,
			},
		})
	} catch (error) {
		console.error('Error en registro:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
