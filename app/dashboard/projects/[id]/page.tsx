'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Project, Task, User } from '@/types'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import { useApi } from '@/hooks/useApi'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	ArrowLeft,
	Settings,
	Users,
	Calendar,
	Target,
	TrendingUp,
	Clock,
	CheckCircle2,
	AlertCircle,
	FolderOpen,
} from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const statusConfig = {
	ACTIVE: {
		color: 'bg-green-100 text-green-700',
		label: 'Activo',
		icon: Target,
	},
	COMPLETED: {
		color: 'bg-blue-100 text-blue-700',
		label: 'Completado',
		icon: CheckCircle2,
	},
	ARCHIVED: {
		color: 'bg-gray-100 text-gray-700',
		label: 'Archivado',
		icon: FolderOpen,
	},
}

const priorityConfig = {
	LOW: { color: 'bg-gray-500', label: 'Baja' },
	MEDIUM: { color: 'bg-blue-500', label: 'Media' },
	HIGH: { color: 'bg-orange-500', label: 'Alta' },
	URGENT: { color: 'bg-red-500', label: 'Urgente' },
}

export default function ProjectDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { toast } = useToast()

	// Estados principales
	const [project, setProject] = useState<Project | null>(null)
	const [tasks, setTasks] = useState<Task[]>([])
	const [users, setUsers] = useState<User[]>([])
	const [projectStats, setProjectStats] = useState({
		totalTasks: 0,
		completedTasks: 0,
		pendingTasks: 0,
		overdueTasks: 0,
		progressPercentage: 0,
	})

	const { loading, error, execute } = useApi<Project>()

	useEffect(() => {
		if (params.id) {
			loadProjectData()
		}
	}, [params.id])

	useEffect(() => {
		// Calcular estadísticas cuando cambien las tareas
		calculateProjectStats()
	}, [tasks])

	const loadProjectData = async () => {
		try {
			await execute(async () => {
				const response = await fetch(`/api/projects/${params.id}`)
				if (!response.ok) {
					if (response.status === 404) {
						throw new Error('Proyecto no encontrado')
					}
					if (response.status === 403) {
						throw new Error('No tienes permisos para ver este proyecto')
					}
					throw new Error('Error al cargar proyecto')
				}

				const projectData = await response.json()
				setProject(projectData)
				setTasks(projectData.tasks || [])
				setUsers(projectData.members || [])
				return projectData
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'No se pudo cargar el proyecto',
				variant: 'destructive',
			})

			// Redirigir a la lista de proyectos si hay error
			setTimeout(() => {
				router.push('/dashboard/projects')
			}, 2000)
		}
	}

	const calculateProjectStats = () => {
		const totalTasks = tasks.length
		const completedTasks = tasks.filter((t) => t.status === 'DONE').length
		const pendingTasks = tasks.filter((t) => t.status !== 'DONE').length

		// Tareas vencidas
		const now = new Date()
		const overdueTasks = tasks.filter((t) => {
			if (!t.dueDate || t.status === 'DONE') return false
			const dueDate = parseISO(t.dueDate)
			return isValid(dueDate) && dueDate < now
		}).length

		const progressPercentage =
			totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

		setProjectStats({
			totalTasks,
			completedTasks,
			pendingTasks,
			overdueTasks,
			progressPercentage,
		})
	}

	const handleTaskMove = async (taskId: string, newStatus: string) => {
		// Optimistic update
		const oldTasks = [...tasks]
		setTasks(
			tasks.map((t) =>
				t.id === taskId ? { ...t, status: newStatus as any } : t,
			),
		)

		try {
			const response = await fetch(`/api/tasks/${taskId}/move`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			})

			if (!response.ok) {
				throw new Error('Error al mover tarea')
			}

			const updatedTask = await response.json()
			setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))

			toast({
				title: 'Tarea movida',
				description: `La tarea se movió a ${newStatus}`,
			})
		} catch (error: any) {
			// Revertir cambio optimista
			setTasks(oldTasks)
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	const handleTaskCreate = async (taskData: Partial<Task>) => {
		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...taskData,
					projectId: params.id,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al crear tarea')
			}

			const newTask = await response.json()
			setTasks([...tasks, newTask])

			toast({
				title: 'Tarea creada',
				description: 'La nueva tarea se ha creado correctamente',
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	const handleTaskEdit = async (task: Task) => {
		try {
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(task),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al actualizar tarea')
			}

			const updatedTask = await response.json()
			setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)))

			toast({
				title: 'Tarea actualizada',
				description: 'Los cambios se han guardado correctamente',
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	const handleTaskDelete = async (taskId: string) => {
		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al eliminar tarea')
			}

			setTasks(tasks.filter((t) => t.id !== taskId))

			toast({
				title: 'Tarea eliminada',
				description: 'La tarea se ha eliminado correctamente',
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	// Loading state
	if (loading) {
		return (
			<div className="space-y-6">
				{/* Header skeleton */}
				<div className="flex items-center gap-4 animate-pulse">
					<div className="h-10 w-10 bg-muted rounded"></div>
					<div className="flex-1 space-y-2">
						<div className="h-8 bg-muted rounded w-1/3"></div>
						<div className="h-4 bg-muted rounded w-1/2"></div>
					</div>
				</div>

				{/* Stats skeleton */}
				<div className="grid gap-4 md:grid-cols-4">
					{[...Array(4)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardContent className="p-6">
								<div className="space-y-2">
									<div className="h-4 bg-muted rounded w-1/2"></div>
									<div className="h-8 bg-muted rounded w-1/3"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Kanban skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(4)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardContent className="p-6">
								<div className="space-y-3">
									<div className="h-4 bg-muted rounded"></div>
									<div className="h-32 bg-muted rounded"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="text-center py-12">
				<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
				<h2 className="text-xl font-semibold mb-2">
					Error al cargar el proyecto
				</h2>
				<p className="text-muted-foreground mb-4">{error.message}</p>
				<div className="flex gap-2 justify-center">
					<Button
						variant="outline"
						onClick={() => router.push('/dashboard/projects')}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Volver a Proyectos
					</Button>
					<Button onClick={loadProjectData}>Reintentar</Button>
				</div>
			</div>
		)
	}

	// Not found state
	if (!project) {
		return (
			<div className="text-center py-12">
				<FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<h2 className="text-xl font-semibold mb-2">Proyecto no encontrado</h2>
				<p className="text-muted-foreground mb-4">
					El proyecto que buscas no existe o no tienes permisos para verlo.
				</p>
				<Button onClick={() => router.push('/dashboard/projects')}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Volver a Proyectos
				</Button>
			</div>
		)
	}

	const statusInfo = statusConfig[project.status as keyof typeof statusConfig]
	const priorityInfo =
		priorityConfig[project.priority as keyof typeof priorityConfig]
	const StatusIcon = statusInfo.icon

	const endDate = project.endDate ? parseISO(project.endDate) : null
	const isOverdue =
		endDate &&
		isValid(endDate) &&
		endDate < new Date() &&
		project.status !== 'COMPLETED'

	return (
		<div className="space-y-6">
			{/* Project Header */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push('/dashboard/projects')}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Proyectos
					</Button>

					<div className="flex items-center gap-3">
						<div
							className={cn(
								'p-2 rounded-lg',
								priorityInfo.color.replace('bg-', 'bg-').replace('500', '100'),
							)}
						>
							<StatusIcon
								className={cn(
									'h-6 w-6',
									priorityInfo.color.replace('bg-', 'text-'),
								)}
							/>
						</div>

						<div>
							<h1 className="text-2xl font-bold">{project.name}</h1>
							<p className="text-muted-foreground">
								{project.description || 'Sin descripción'}
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3">
					{/* Project Status */}
					<Badge className={statusInfo.color}>{statusInfo.label}</Badge>

					{/* Project Priority */}
					<Badge
						variant="outline"
						className={priorityInfo.color.replace('bg-', 'border-')}
					>
						{priorityInfo.label}
					</Badge>

					{/* Settings Button */}
					<Button variant="outline" size="sm">
						<Settings className="h-4 w-4 mr-2" />
						Configurar
					</Button>
				</div>
			</div>

			{/* Project Info Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Progress */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-medium">Progreso</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{projectStats.progressPercentage}%
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
							<div
								className="bg-primary h-2 rounded-full transition-all duration-500"
								style={{ width: `${projectStats.progressPercentage}%` }}
							></div>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{projectStats.completedTasks} de {projectStats.totalTasks} tareas
							completadas
						</p>
					</CardContent>
				</Card>

				{/* Team Members */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-medium">Equipo</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{project.members?.length || 0}
						</div>
						<div className="flex -space-x-2 mt-2">
							{project.members?.slice(0, 4).map((member) => (
								<Avatar
									key={member.id}
									className="h-6 w-6 border-2 border-background"
								>
									<AvatarImage src={member.avatar} />
									<AvatarFallback className="text-xs">
										{member.name?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							))}
							{(project.members?.length || 0) > 4 && (
								<div className="h-6 w-6 bg-muted border-2 border-background rounded-full flex items-center justify-center text-xs">
									+{(project.members?.length || 0) - 4}
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Pending Tasks */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-medium">Pendientes</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{projectStats.pendingTasks}
						</div>
						<p className="text-xs text-muted-foreground">
							tareas por completar
						</p>
					</CardContent>
				</Card>

				{/* Due Date */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-medium">
								Fecha límite
							</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardHeader>
					<CardContent>
						{endDate && isValid(endDate) ? (
							<>
								<div
									className={cn(
										'text-2xl font-bold',
										isOverdue ? 'text-red-600' : 'text-foreground',
									)}
								>
									{format(endDate, 'dd MMM', { locale: es })}
								</div>
								<p
									className={cn(
										'text-xs',
										isOverdue ? 'text-red-600' : 'text-muted-foreground',
									)}
								>
									{isOverdue
										? 'Vencido'
										: format(endDate, 'yyyy', { locale: es })}
								</p>
								{projectStats.overdueTasks > 0 && (
									<Badge variant="destructive" className="mt-1 text-xs">
										{projectStats.overdueTasks} vencidas
									</Badge>
								)}
							</>
						) : (
							<>
								<div className="text-2xl font-bold text-muted-foreground">
									--
								</div>
								<p className="text-xs text-muted-foreground">
									Sin fecha límite
								</p>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Kanban Board */}
			<KanbanBoard projectId={project.id} />
		</div>
	)
}
