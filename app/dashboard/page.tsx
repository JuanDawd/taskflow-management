import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	CheckIcon,
	ClockIcon,
	PersonIcon,
	RocketIcon,
} from '@radix-ui/react-icons'

interface DashboardStats {
	totalTasks: number
	completedTasks: number
	pendingTasks: number
	totalProjects: number
}

interface RecentTask {
	id: string
	title: string
	status: string
	priority: string
	assignee?: {
		name: string
	}
	project: {
		name: string
	}
}

export default function DashboardPage() {
	const [stats, setStats] = useState<DashboardStats>({
		totalTasks: 0,
		completedTasks: 0,
		pendingTasks: 0,
		totalProjects: 0,
	})
	const [recentTasks, setRecentTasks] = useState<RecentTask[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchDashboardData()
	}, [])

	const fetchDashboardData = async () => {
		try {
			const [statsResponse, tasksResponse] = await Promise.all([
				fetch('/api/dashboard/stats'),
				fetch('/api/dashboard/recent-tasks'),
			])

			if (statsResponse.ok) {
				const statsData = await statsResponse.json()
				setStats(statsData)
			}

			if (tasksResponse.ok) {
				const tasksData = await tasksResponse.json()
				setRecentTasks(tasksData.tasks)
			}
		} catch (error) {
			console.error('Error fetching dashboard data:', error)
		} finally {
			setLoading(false)
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'DONE':
				return 'text-green-600 bg-green-100'
			case 'IN_PROGRESS':
				return 'text-blue-600 bg-blue-100'
			case 'IN_REVIEW':
				return 'text-yellow-600 bg-yellow-100'
			default:
				return 'text-gray-600 bg-gray-100'
		}
	}

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'URGENT':
				return 'text-red-600'
			case 'HIGH':
				return 'text-orange-600'
			case 'MEDIUM':
				return 'text-yellow-600'
			default:
				return 'text-gray-600'
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-gray-600">Resumen de tus proyectos y tareas</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total de Tareas
						</CardTitle>
						<CheckIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalTasks}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completadas</CardTitle>
						<CheckIcon className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{stats.completedTasks}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pendientes</CardTitle>
						<ClockIcon className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">
							{stats.pendingTasks}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Proyectos</CardTitle>
						<RocketIcon className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">
							{stats.totalProjects}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Tasks */}
			<Card>
				<CardHeader>
					<CardTitle>Tareas Recientes</CardTitle>
				</CardHeader>
				<CardContent>
					{recentTasks.length === 0 ? (
						<p className="text-gray-500 text-center py-8">
							No hay tareas recientes
						</p>
					) : (
						<div className="space-y-4">
							{recentTasks.map((task) => (
								<div
									key={task.id}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div className="flex-1">
										<h3 className="font-medium text-gray-900">{task.title}</h3>
										<p className="text-sm text-gray-500">{task.project.name}</p>
									</div>
									<div className="flex items-center space-x-3">
										<span
											className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
												task.status,
											)}`}
										>
											{task.status.replace('_', ' ')}
										</span>
										<span
											className={`text-sm font-medium ${getPriorityColor(
												task.priority,
											)}`}
										>
											{task.priority}
										</span>
										{task.assignee && (
											<div className="flex items-center space-x-1">
												<PersonIcon className="h-4 w-4 text-gray-400" />
												<span className="text-sm text-gray-600">
													{task.assignee.name}
												</span>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
