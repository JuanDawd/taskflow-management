import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json()

		const user = await db.user.findUnique({
			where: { email },
			include: {
				company: true,
			},
		})

		if (!user) {
			return NextResponse.json(
				{ error: 'Credenciales inválidas' },
				{ status: 401 },
			)
		}

		// Verificar contraseña
		const isValidPassword = await bcrypt.compare(password, user.password)

		if (!isValidPassword) {
			return NextResponse.json(
				{ error: 'Credenciales inválidas' },
				{ status: 401 },
			)
		}

		// Just return user data for NextAuth
		return NextResponse.json({
			message: 'Login exitoso',
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				company: {
					id: user.company.id,
					name: user.company.name,
					slug: user.company.slug,
				},
			},
		})
	} catch (error) {
		console.error('Error en login:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
