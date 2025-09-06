import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
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

		const projects = await db.project.findMany({
			where: {
				companyId,
			},
			include: {
				_count: {
					select: {
						tasks: true,
						members: true,
					},
				},
				members: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								role: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return NextResponse.json({ projects })
	} catch (error) {
		console.error('Error fetching projects:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const token = request.cookies.get('auth-token')?.value

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || 'fallback-secret',
		) as any
		const userId = decoded.userId
		const companyId = decoded.companyId
		const userRole = decoded.role

		// Solo admins pueden crear proyectos
		if (userRole !== 'ADMIN') {
			return NextResponse.json(
				{
					error: 'Solo los administradores pueden crear proyectos',
				},
				{ status: 403 },
			)
		}

		const { name, description, slug, color } = await request.json()

		// Verificar que el slug no existe en la empresa
		const existingProject = await db.project.findFirst({
			where: {
				companyId,
				slug,
			},
		})

		if (existingProject) {
			return NextResponse.json(
				{
					error: 'Ya existe un proyecto con ese identificador',
				},
				{ status: 400 },
			)
		}

		const project = await db.project.create({
			data: {
				name,
				description,
				slug,
				color: color || '#3B82F6',
				companyId,
			},
		})

		// Agregar al creador como miembro del proyecto
		await db.projectMember.create({
			data: {
				userId,
				projectId: project.id,
				role: 'ADMIN',
			},
		})

		return NextResponse.json({ project })
	} catch (error) {
		console.error('Error creating project:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
