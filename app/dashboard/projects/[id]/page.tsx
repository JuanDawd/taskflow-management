'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Project, Task } from '@/types'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import { useApi } from '@/hooks/useApi'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
	MoreHorizontal,
	UserPlus,
	Edit,
	Archive,
	Copy,
	Share,
	Download,
	Activity,
	BarChart3,
	MessageSquare,
	FileText,
} from 'lucide-react'
import { format, parseISO, isValid, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const statusConfig = {
	ACTIVE: {
		color: 'bg-green-100 text-green-700 border-green-200',
		label: 'Activo',
		icon: Target,
	},
	COMPLETED: {
		color: 'bg-blue-100 text-blue-700 border-blue-200',
		label: 'Completado',
		icon: CheckCircle2,
	},
	ARCHIVED: {
		color: 'bg-gray-100 text-gray-700 border-gray-200',
		label: 'Archivado',
		icon: FolderOpen,
	},
	ON_HOLD: {
		color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
		label: 'En espera',
		icon: Clock,
	},
}

const priorityConfig = {
	LOW: { color: 'bg-gray-500', label: 'Baja', textColor: 'text-gray-600' },
	MEDIUM: { color: 'bg-blue-500', label: 'Media', textColor: 'text-blue-600' },
	HIGH: { color: 'bg-orange-500', label: 'Alta', textColor: 'text-orange-600' },
	URGENT: { color: 'bg-red-500', label: 'Urgente', textColor: 'text-red-600' },
}

interface ProjectStats {
	totalTasks: number
	completedTasks: number
	pendingTasks: number
	overdueTasks: number
	progressPercentage: number
	recentActivity: number
	totalComments: number
	totalFiles: number
}

export default function ProjectDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { toast } = useToast()

	// Estados principales
	const [project, setProject] = useState<Project | null>(null)
	const [tasks, setTasks] = useState<Task[]>([])
	const [projectStats, setProjectStats] = useState<ProjectStats>({
		totalTasks: 0,
		completedTasks: 0,
		pendingTasks: 0,
		overdueTasks: 0,
		progressPercentage: 0,
		recentActivity: 0,
		totalComments: 0,
		totalFiles: 0,
	})
	const [activeTab, setActiveTab] = useState('kanban')
	const [showMemberDialog, setShowMemberDialog] = useState(false)

	const { loading, error, execute } = useApi<Project>()

	const loadProjectData = useCallback(async () => {
		if (!params.id) return

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
				return projectData
			})
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'No se pudo cargar el proyecto'
			toast({
				title: 'Error',
				description: errorMessage,
				variant: 'destructive',
			})

			// Redirigir a la lista de proyectos si hay error
			setTimeout(() => {
				router.push('/dashboard/projects')
			}, 2000)
		}
	}, [execute, params.id, router, toast])

	useEffect(() => {
		loadProjectData()
	}, [loadProjectData])

	useEffect(() => {
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

			// Actividad reciente (tareas actualizadas en los últimos 7 días)
			const sevenDaysAgo = new Date()
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
			const recentActivity = tasks.filter((t) => {
				const updatedDate = parseISO(t.updatedAt)
				return isValid(updatedDate) && updatedDate > sevenDaysAgo
			}).length

			const progressPercentage =
				totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

			// Simular comentarios y archivos (estos vendrían de la API)
			const totalComments = tasks.reduce(
				(sum, task) => sum + (task.comments?.length || 0),
				0,
			)
			const totalFiles = tasks.reduce(
				(sum, task) => sum + (task.attachments?.length || 0),
				0,
			)

			setProjectStats({
				totalTasks,
				completedTasks,
				pendingTasks,
				overdueTasks,
				progressPercentage,
				recentActivity,
				totalComments,
				totalFiles,
			})
		}

		calculateProjectStats()
	}, [tasks])

	const handleProjectAction = async (action: string) => {
		switch (action) {
			case 'duplicate':
				// Implementar duplicación de proyecto
				toast({
					title: 'Funcionalidad en desarrollo',
					description: 'Duplicar proyecto próximamente',
				})
				break
			case 'archive':
				// Implementar archivado
				toast({
					title: 'Funcionalidad en desarrollo',
					description: 'Archivar proyecto próximamente',
				})
				break
			case 'export':
				// Implementar exportación
				toast({
					title: 'Funcionalidad en desarrollo',
					description: 'Exportar datos próximamente',
				})
				break
			case 'share':
				// Implementar compartir
				toast({
					title: 'Funcionalidad en desarrollo',
					description: 'Compartir proyecto próximamente',
				})
				break
		}
	}

	// Loading state
	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4 animate-pulse">
					<div className="h-10 w-10 bg-muted rounded"></div>
					<div className="flex-1 space-y-2">
						<div className="h-8 bg-muted rounded w-1/3"></div>
						<div className="h-4 bg-muted rounded w-1/2"></div>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

				<div className="h-96 bg-muted rounded animate-pulse"></div>
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
	const daysUntilDue =
		endDate && isValid(endDate) ? differenceInDays(endDate, new Date()) : null

	return (
		<div className="space-y-6">
			{/* Project Header */}
			<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push('/dashboard/projects')}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Proyectos
					</Button>

					<div className="flex items-start gap-4">
						<div className={cn('p-3 rounded-lg border', statusInfo.color)}>
							<StatusIcon className="h-6 w-6" />
						</div>

						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<h1 className="text-2xl font-bold">{project.name}</h1>
								<Badge className={statusInfo.color}>{statusInfo.label}</Badge>
								<Badge
									variant="outline"
									className={cn('border-2', priorityInfo.textColor)}
								>
									<div
										className={cn(
											'w-2 h-2 rounded-full mr-1',
											priorityInfo.color,
										)}
									/>
									{priorityInfo.label}
								</Badge>
							</div>
							<p className="text-muted-foreground max-w-2xl">
								{project.description || 'Sin descripción'}
							</p>
							{endDate && isValid(endDate) && (
								<div className="flex items-center gap-2 text-sm">
									<Calendar className="h-4 w-4" />
									<span className={cn(isOverdue && 'text-red-600')}>
										Vence: {format(endDate, 'dd MMM yyyy', { locale: es })}
										{daysUntilDue !== null && (
											<span className="ml-1">
												(
												{daysUntilDue > 0
													? `${daysUntilDue} días restantes`
													: `${Math.abs(daysUntilDue)} días vencido`}
												)
											</span>
										)}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm">
								<UserPlus className="h-4 w-4 mr-2" />
								Invitar
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Invitar miembros al proyecto</DialogTitle>
								<DialogDescription>
									Agrega nuevos miembros a tu equipo de proyecto.
								</DialogDescription>
							</DialogHeader>
							{/* Aquí iría el formulario de invitación */}
							<p className="text-center py-4 text-muted-foreground">
								Formulario de invitación próximamente
							</p>
						</DialogContent>
					</Dialog>

					<Button variant="outline" size="sm">
						<Edit className="h-4 w-4 mr-2" />
						Editar
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => handleProjectAction('duplicate')}
							>
								<Copy className="h-4 w-4 mr-2" />
								Duplicar proyecto
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleProjectAction('share')}>
								<Share className="h-4 w-4 mr-2" />
								Compartir
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleProjectAction('export')}>
								<Download className="h-4 w-4 mr-2" />
								Exportar datos
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => handleProjectAction('archive')}>
								<Archive className="h-4 w-4 mr-2" />
								Archivar proyecto
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Enhanced Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
				{/* Progress */}
				<Card className="lg:col-span-2">
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-medium">
								Progreso del Proyecto
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold mb-2">
							{projectStats.progressPercentage}%
						</div>
						<Progress
							value={projectStats.progressPercentage}
							className="mb-2"
						/>
						<p className="text-xs text-muted-foreground">
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
						<div className="text-2xl font-bold mb-2">
							{project.members?.length || 0}
						</div>
						<div className="flex -space-x-2">
							{project.members?.slice(0, 4).map((member) => (
								<Avatar
									key={member.id}
									className="h-6 w-6 border-2 border-background"
								>
									{member.avatar ? (
										<AvatarImage src={member.avatar} />
									) : (
										<AvatarFallback className="text-xs">
											{member.name?.charAt(0).toUpperCase()}
										</AvatarFallback>
									)}
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
							<Clock className="h-4 w-4 text-orange-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{projectStats.pendingTasks}
						</div>
						<p className="text-xs text-muted-foreground">tareas activas</p>
						{projectStats.overdueTasks > 0 && (
							<Badge variant="destructive" className="mt-1 text-xs">
								{projectStats.overdueTasks} vencidas
							</Badge>
						)}
					</CardContent>
				</Card>

				{/* Recent Activity */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-medium">Actividad</CardTitle>
							<Activity className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{projectStats.recentActivity}
						</div>
						<p className="text-xs text-muted-foreground">últimos 7 días</p>
					</CardContent>
				</Card>

				{/* Comments & Files */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-medium">Recursos</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-1">
							<div className="flex justify-between text-sm">
								<span className="flex items-center gap-1">
									<MessageSquare className="h-3 w-3" />
									Comentarios
								</span>
								<span className="font-medium">
									{projectStats.totalComments}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="flex items-center gap-1">
									<FileText className="h-3 w-3" />
									Archivos
								</span>
								<span className="font-medium">{projectStats.totalFiles}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Project Content Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="kanban" className="flex items-center gap-2">
						<Target className="h-4 w-4" />
						Kanban
					</TabsTrigger>
					<TabsTrigger value="analytics" className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4" />
						Analíticas
					</TabsTrigger>
					<TabsTrigger value="activity" className="flex items-center gap-2">
						<Activity className="h-4 w-4" />
						Actividad
					</TabsTrigger>
					<TabsTrigger value="settings" className="flex items-center gap-2">
						<Settings className="h-4 w-4" />
						Configuración
					</TabsTrigger>
				</TabsList>

				<TabsContent value="kanban" className="space-y-4">
					<KanbanBoard projectId={project.id} />
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Analíticas del Proyecto</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-center py-8 text-muted-foreground">
								Dashboard de analíticas próximamente
							</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="activity" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Actividad Reciente</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-center py-8 text-muted-foreground">
								Feed de actividad próximamente
							</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="settings" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Configuración del Proyecto</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-center py-8 text-muted-foreground">
								Configuración de proyecto próximamente
							</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
