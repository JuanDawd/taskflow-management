import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
	try {
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		})

		if (!token) {
			return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
		}
		const companyId = token.companyId

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
