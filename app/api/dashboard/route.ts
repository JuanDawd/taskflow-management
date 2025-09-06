import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const range = searchParams.get('range') || '7d'

		// Calculate date range
		const now = new Date()
		const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90
		const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

		// Get user's company
		const user = await db.user.findUnique({
			where: { email: session.user.email },
			include: { company: true },
		})

		if (!user?.companyId) {
			return NextResponse.json({ error: 'Company not found' }, { status: 404 })
		}

		// Fetch all tasks for the company
		const tasks = await db.task.findMany({
			where: {
				project: {
					companyId: user.companyId,
				},
				createdAt: {
					gte: startDate,
				},
			},
			include: {
				assignee: true,
				project: true,
				_count: {
					select: { comments: true },
				},
			},
		})

		// Calculate metrics
		const totalTasks = tasks.length
		const completedTasks = tasks.filter((task) => task.status === 'DONE').length
		const overdueTasks = tasks.filter(
			(task) => task.dueDate && task.dueDate < now && task.status !== 'DONE',
		).length

		// Get active projects
		const activeProjects = await db.project.count({
			where: {
				companyId: user.companyId,
				isActive: true,
			},
		})

		// Get team members
		const teamMembers = await db.user.count({
			where: { companyId: user.companyId },
		})

		// Calculate average completion time
		const completedTasksWithTime = tasks.filter(
			(task) => task.status === 'DONE' && task.updatedAt && task.createdAt,
		)

		const avgCompletionTime =
			completedTasksWithTime.length > 0
				? completedTasksWithTime.reduce((acc, task) => {
						const timeDiff = task.updatedAt.getTime() - task.createdAt.getTime()
						return acc + timeDiff / (1000 * 60 * 60 * 24) // days
				  }, 0) / completedTasksWithTime.length
				: 0

		// Calculate productivity score
		const productivityScore = Math.round(
			totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
		)

		// Tasks by status
		const tasksByStatus = [
			{
				name: 'Por hacer',
				value: tasks.filter((t) => t.status === 'TODO').length,
				color: COLORS.TODO,
			},
			{
				name: 'En progreso',
				value: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
				color: COLORS.IN_PROGRESS,
			},
			{
				name: 'En revisión',
				value: tasks.filter((t) => t.status === 'REVIEW').length,
				color: COLORS.REVIEW,
			},
			{
				name: 'Completadas',
				value: tasks.filter((t) => t.status === 'DONE').length,
				color: COLORS.DONE,
			},
		].filter((item) => item.value > 0)

		// Tasks by priority
		const tasksByPriority = [
			{
				name: 'Baja',
				value: tasks.filter((t) => t.priority === 'LOW').length,
				color: COLORS.LOW,
			},
			{
				name: 'Media',
				value: tasks.filter((t) => t.priority === 'MEDIUM').length,
				color: COLORS.MEDIUM,
			},
			{
				name: 'Alta',
				value: tasks.filter((t) => t.priority === 'HIGH').length,
				color: COLORS.HIGH,
			},
			{
				name: 'Urgente',
				value: tasks.filter((t) => t.priority === 'URGENT').length,
				color: COLORS.URGENT,
			},
		].filter((item) => item.value > 0)

		// Weekly progress
		const weeklyProgress = []
		for (let i = daysAgo - 1; i >= 0; i--) {
			const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
			const dayStart = new Date(date.setHours(0, 0, 0, 0))
			const dayEnd = new Date(date.setHours(23, 59, 59, 999))

			const created = tasks.filter(
				(task) => task.createdAt >= dayStart && task.createdAt <= dayEnd,
			).length

			const completed = tasks.filter(
				(task) =>
					task.status === 'DONE' &&
					task.updatedAt >= dayStart &&
					task.updatedAt <= dayEnd,
			).length

			weeklyProgress.push({
				date: date.toLocaleDateString('es-ES', {
					month: 'short',
					day: 'numeric',
				}),
				created,
				completed,
			})
		}

		// Top performers
		const userPerformance = await db.user.findMany({
			where: { companyId: user.companyId },
			include: {
				assignedTasks: {
					where: {
						status: 'DONE',
						updatedAt: {
							gte: startDate,
						},
					},
				},
			},
		})

		const topPerformers = userPerformance
			.map((u) => ({
				id: u.id,
				name: u.name || u.email,
				avatar: u.avatar,
				completedTasks: u.assignedTasks.length,
				score: Math.round(
					(u.assignedTasks.length / Math.max(totalTasks, 1)) * 100,
				),
			}))
			.sort((a, b) => b.completedTasks - a.completedTasks)
			.slice(0, 5)

		// Project progress
		const projects = await db.project.findMany({
			where: {
				companyId: user.companyId,
				isActive: true,
			},
			include: {
				tasks: true,
			},
		})

		const projectProgress = projects.map((project) => {
			const total = project.tasks.length
			const completed = project.tasks.filter(
				(task) => task.status === 'DONE',
			).length
			return {
				name: project.name,
				completed,
				total,
				percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
			}
		})

		const dashboardData: DashboardMetrics = {
			totalTasks,
			completedTasks,
			overdueTasks,
			activeProjects,
			teamMembers,
			avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
			productivityScore,
			tasksByStatus,
			tasksByPriority,
			weeklyProgress,
			topPerformers,
			projectProgress,
		}

		return NextResponse.json(dashboardData)
	} catch (error) {
		console.error('Dashboard API error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
