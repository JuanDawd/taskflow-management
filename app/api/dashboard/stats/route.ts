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

		// Obtener estadísticas
		const [totalTasks, completedTasks, totalProjects] = await Promise.all([
			db.task.count({
				where: {
					project: {
						companyId,
					},
				},
			}),
			db.task.count({
				where: {
					status: 'DONE',
					project: {
						companyId,
					},
				},
			}),
			db.project.count({
				where: {
					companyId,
				},
			}),
		])

		const pendingTasks = totalTasks - completedTasks

		return NextResponse.json({
			totalTasks,
			completedTasks,
			pendingTasks,
			totalProjects,
		})
	} catch (error) {
		console.error('Error fetching stats:', error)
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 },
		)
	}
}
