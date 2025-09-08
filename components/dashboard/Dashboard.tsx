'use client'

import { useState, useEffect } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Area,
	AreaChart,
} from 'recharts'
import { CheckCircle, AlertCircle, TrendingUp, Target } from 'lucide-react'
import { Button } from '../ui/button'

interface DashboardMetrics {
	totalTasks: number
	completedTasks: number
	overdueTasks: number
	activeProjects: number
	teamMembers: number
	avgCompletionTime: number
	productivityScore: number
	tasksByStatus: Array<{ name: string; value: number; color: string }>
	tasksByPriority: Array<{ name: string; value: number; color: string }>
	weeklyProgress: Array<{ date: string; completed: number; created: number }>
	topPerformers: Array<{
		id: string
		name: string
		avatar?: string
		completedTasks: number
		score: number
	}>
	projectProgress: Array<{
		name: string
		completed: number
		total: number
		percentage: number
	}>
}

export function Dashboard() {
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [timeRange, setTimeRange] = useState('7d')

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setIsLoading(true)
				const response = await fetch(`/api/dashboard?range=${timeRange}`)
				if (response.ok) {
					const data = await response.json()
					setMetrics(data)
				}
			} catch (error) {
				console.error('Error fetching dashboard data:', error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchDashboardData()
	}, [timeRange])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	if (!metrics) {
		return (
			<div className="text-center py-6 text-gray-500">
				No se pudieron cargar las métricas
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="text-gray-600">
						Resumen de actividad y métricas del equipo
					</p>
				</div>
				<div className="flex gap-2">
					{[
						{ value: '7d', label: '7 días' },
						{ value: '30d', label: '30 días' },
						{ value: '90d', label: '90 días' },
					].map((range) => (
						<Button
							key={range.value}
							variant={timeRange === range.value ? 'default' : 'outline'}
							size="sm"
							onClick={() => setTimeRange(range.value)}
						>
							{range.label}
						</Button>
					))}
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					title="Total de Tareas"
					value={metrics.totalTasks}
					icon={<Target className="h-4 w-4" />}
					description="Tareas activas"
				/>
				<MetricCard
					title="Completadas"
					value={metrics.completedTasks}
					icon={<CheckCircle className="h-4 w-4" />}
					description={`${Math.round(
						(metrics.completedTasks / metrics.totalTasks) * 100,
					)}% del total`}
					color="text-green-600"
				/>
				<MetricCard
					title="Vencidas"
					value={metrics.overdueTasks}
					icon={<AlertCircle className="h-4 w-4" />}
					description="Requieren atención"
					color="text-red-600"
				/>
				<MetricCard
					title="Productividad"
					value={`${metrics.productivityScore}%`}
					icon={<TrendingUp className="h-4 w-4" />}
					description="Score del equipo"
					color="text-blue-600"
				/>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Tasks by Status */}
				<Card>
					<CardHeader>
						<CardTitle>Distribución por Estado</CardTitle>
						<CardDescription>
							Tareas organizadas por estado actual
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={metrics.tasksByStatus}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) =>
										`${name} ${(percent ?? 0 * 100).toFixed(0)}%`
									}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{metrics.tasksByStatus.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Tasks by Priority */}
				<Card>
					<CardHeader>
						<CardTitle>Distribución por Prioridad</CardTitle>
						<CardDescription>
							Tareas organizadas por nivel de prioridad
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={metrics.tasksByPriority}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="value" fill="#8884d8">
									{metrics.tasksByPriority.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Progress and Performance */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Weekly Progress */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Progreso Semanal</CardTitle>
						<CardDescription>Tareas creadas vs completadas</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart data={metrics.weeklyProgress}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Area
									type="monotone"
									dataKey="completed"
									stackId="1"
									stroke="#10b981"
									fill="#10b981"
									fillOpacity={0.6}
									name="Completadas"
								/>
								<Area
									type="monotone"
									dataKey="created"
									stackId="2"
									stroke="#3b82f6"
									fill="#3b82f6"
									fillOpacity={0.6}
									name="Creadas"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Top Performers */}
				<Card>
					<CardHeader>
						<CardTitle>Top Performers</CardTitle>
						<CardDescription>Miembros más productivos</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{metrics.topPerformers.map((performer, index) => (
								<div key={performer.id} className="flex items-center gap-3">
									<div className="flex-shrink-0">
										<Badge variant={index === 0 ? 'default' : 'secondary'}>
											#{index + 1}
										</Badge>
									</div>
									<Avatar className="h-8 w-8">
										<AvatarImage src={performer.avatar} />
										<AvatarFallback className="text-xs">
											{performer.name
												.split(' ')
												.map((n) => n[0])
												.join('')}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium truncate">
											{performer.name}
										</div>
										<div className="text-xs text-gray-500">
											{performer.completedTasks} tareas completadas
										</div>
									</div>
									<div className="text-right">
										<div className="text-sm font-medium text-green-600">
											{performer.score}%
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Project Progress */}
			<Card>
				<CardHeader>
					<CardTitle>Progreso de Proyectos</CardTitle>
					<CardDescription>
						Estado actual de todos los proyectos activos
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{metrics.projectProgress.map((project) => (
							<div key={project.name} className="space-y-2">
								<div className="flex justify-between items-center">
									<div className="font-medium">{project.name}</div>
									<div className="text-sm text-gray-600">
										{project.completed}/{project.total} tareas
									</div>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="bg-blue-600 h-2 rounded-full transition-all duration-300"
										style={{ width: `${project.percentage}%` }}
									/>
								</div>
								<div className="text-xs text-gray-500">
									{project.percentage}% completado
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

interface MetricCardProps {
	title: string
	value: string | number
	icon: React.ReactNode
	description: string
	color?: string
}

function MetricCard({
	title,
	value,
	icon,
	description,
	color = 'text-gray-600',
}: MetricCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<div className={color}>{icon}</div>
			</CardHeader>
			<CardContent>
				<div className={`text-2xl font-bold ${color}`}>{value}</div>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	)
}
