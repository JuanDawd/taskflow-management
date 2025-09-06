import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

interface Context {
	params: Promise<{ slug: string }> // ✅ Promise
}

export async function GET(request: NextRequest, { params }: Context) {
	try {
		const token = request.cookies.get('auth-token')?.value

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'fallback-secret',
		) as any
		const companyId = decoded.companyId

		const { slug } = await params

		const project = await db.project.findFirst({
			where: {
				slug,
				companyId,
			},
			include: {
				_count: {
					select: {
						tasks: true,
					},
				},
				members: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								role: true,
								email: true,
							},
						},
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

		return NextResponse.json({ project })
	} catch (error) {
		console.error('Error fetching project:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
