import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json()

		// Buscar usuario con su empresa
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

		// Crear token JWT
		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				role: user.role,
				companyId: user.companyId,
			},
			process.env.JWT_SECRET || 'fallback-secret',
			{ expiresIn: '7d' },
		)

		// Crear respuesta con cookie
		const response = NextResponse.json({
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

		// Establecer cookie httpOnly
		response.cookies.set('auth-token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7, // 7 días
		})

		return response
	} catch (error) {
		console.error('Error en login:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
