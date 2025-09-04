import { NextResponse } from 'next/server'

export async function POST() {
	const response = NextResponse.json({ message: 'Logout exitoso' })

	// Eliminar cookie de autenticación
	response.cookies.set('auth-token', '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		expires: new Date(0),
	})

	return response
}
