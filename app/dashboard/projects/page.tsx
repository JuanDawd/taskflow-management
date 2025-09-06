'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Project, User } from '@/types'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ProjectDialog } from '@/components/projects/ProjectDialog'
import {
	Plus,
	Search,
	Calendar,
	Users,
	CheckCircle2,
	Clock,
	MoreHorizontal,
	Edit,
	Archive,
	Trash2,
} from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { useToast } from '@/hooks/use-toast'

const statusConfig = {
	ACTIVE: { color: 'bg-green-100 text-green-700', label: 'Activo' },
	COMPLETED: { color: 'bg-blue-100 text-blue-700', label: 'Completado' },
	ARCHIVED: { color: 'bg-gray-100 text-gray-700', label: 'Archivado' },
}

const priorityConfig = {
	LOW: { color: 'border-l-gray-400', label: 'Baja' },
	MEDIUM: { color: 'border-l-blue-400', label: 'Media' },
	HIGH: { color: 'border-l-orange-400', label: 'Alta' },
	URGENT: { color: 'border-l-red-400', label: 'Urgente' },
}

export default function ProjectsPage() {
	const { data: session } = useSession()
	const { toast } = useToast()
	const [projects, setProjects] = useState<Project[]>([])
	const [availableMembers, setAvailableMembers] = useState<User[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedProject, setSelectedProject] = useState<Project | null>(null)
	const [showProjectDialog, setShowProjectDialog] = useState(false)
	const [statusFilter, setStatusFilter] = useState<string>('all')

	const { loading, error, execute } = useApi<Project[]>()

	useEffect(() => {
		loadProjects()
		loadMembers()
	}, [])

	const loadProjects = async () => {
		try {
			await execute(async () => {
				const response = await fetch('/api/projects')
				if (!response.ok) throw new Error('Error al cargar proyectos')
				const data = await response.json()
				setProjects(data)
				return data
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'No se pudieron cargar los proyectos',
				variant: 'destructive',
			})
		}
	}

	const loadMembers = async () => {
		try {
			const response = await fetch('/api/team/members')
			if (response.ok) {
				const data = await response.json()
				setAvailableMembers(data)
			}
		} catch (error) {
			console.error('Error loading members:', error)
		}
	}

	const handleSaveProject = async (projectData: any) => {
		try {
			const url = projectData.id
				? `/api/projects/${projectData.id}`
				: '/api/projects'
			const method = projectData.id ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(projectData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al guardar proyecto')
			}

			const savedProject = await response.json()

			if (projectData.id) {
				setProjects(
					projects.map((p) => (p.id === savedProject.id ? savedProject : p)),
				)
				toast({
					title: 'Proyecto actualizado',
					description: 'Los cambios se han guardado correctamente',
				})
			} else {
				setProjects([savedProject, ...projects])
				toast({
					title: 'Proyecto creado',
					description: 'El nuevo proyecto se ha creado correctamente',
				})
			}
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	const handleDeleteProject = async (projectId: string) => {
		try {
			const response = await fetch(`/api/projects/${projectId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Error al eliminar proyecto')
			}

			setProjects(projects.filter((p) => p.id !== projectId))
			toast({
				title: 'Proyecto eliminado',
				description: 'El proyecto se ha eliminado correctamente',
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	const filteredProjects = projects.filter((project) => {
		const matchesSearch =
			project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			project.description?.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesStatus =
			statusFilter === 'all' || project.status === statusFilter
		return matchesSearch && matchesStatus
	})

	const openEditDialog = (project: Project) => {
		setSelectedProject(project)
		setShowProjectDialog(true)
	}

	const openCreateDialog = () => {
		setSelectedProject(null)
		setShowProjectDialog(true)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Proyectos</h1>
					<p className="text-muted-foreground">
						Gestiona y organiza todos tus proyectos
					</p>
				</div>
				<Button onClick={openCreateDialog}>
					<Plus className="mr-2 h-4 w-4" />
					Nuevo Proyecto
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Buscar proyectos..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant={statusFilter === 'all' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setStatusFilter('all')}
					>
						Todos
					</Button>
					<Button
						variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setStatusFilter('ACTIVE')}
					>
						Activos
					</Button>
					<Button
						variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setStatusFilter('COMPLETED')}
					>
						Completados
					</Button>
				</div>
			</div>

			{/* Projects Grid */}
			{loading ? (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-4 bg-muted rounded w-3/4"></div>
								<div className="h-3 bg-muted rounded w-1/2"></div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="h-3 bg-muted rounded"></div>
									<div className="h-3 bg-muted rounded w-2/3"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : filteredProjects.length === 0 ? (
				<div className="text-center py-12">
					<FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium mb-2">
						{searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos'}
					</h3>
					<p className="text-muted-foreground mb-4">
						{searchTerm
							? 'Intenta con otros términos de búsqueda'
							: 'Comienza creando tu primer proyecto'}
					</p>
					{!searchTerm && (
						<Button onClick={openCreateDialog}>
							<Plus className="mr-2 h-4 w-4" />
							Crear Proyecto
						</Button>
					)}
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filteredProjects.map((project) => {
						const statusInfo =
							statusConfig[project.status as keyof typeof statusConfig]
						const priorityInfo =
							priorityConfig[project.priority as keyof typeof priorityConfig]
						const endDate = project.endDate ? parseISO(project.endDate) : null
						const isOverdue =
							endDate &&
							isValid(endDate) &&
							endDate < new Date() &&
							project.status !== 'COMPLETED'

						return (
							<Card
								key={project.id}
								className={cn(
									'hover:shadow-md transition-all duration-200 border-l-4 cursor-pointer',
									priorityInfo.color,
									isOverdue && 'ring-2 ring-red-200',
								)}
								onClick={() =>
									(window.location.href = `/dashboard/projects/${project.id}`)
								}
							>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="text-lg leading-tight line-clamp-1">
												{project.name}
											</CardTitle>
											<CardDescription className="line-clamp-2 mt-1">
												{project.description || 'Sin descripción'}
											</CardDescription>
										</div>

										<DropdownMenu>
											<DropdownMenuTrigger
												asChild
												onClick={(e) => e.stopPropagation()}
											>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation()
														openEditDialog(project)
													}}
												>
													<Edit className="mr-2 h-4 w-4" />
													Editar
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation()
														// Archive logic
													}}
												>
													<Archive className="mr-2 h-4 w-4" />
													Archivar
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation()
														handleDeleteProject(project.id)
													}}
													className="text-red-600"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Eliminar
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</CardHeader>

								<CardContent className="space-y-4">
									{/* Status and Priority */}
									<div className="flex items-center justify-between">
										<Badge className={statusInfo.color}>
											{statusInfo.label}
										</Badge>
										<Badge variant="outline">{priorityInfo.label}</Badge>
									</div>

									{/* Stats */}
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="flex items-center gap-2 text-muted-foreground">
											<CheckCircle2 className="h-4 w-4" />
											<span>{project._count?.tasks || 0} tareas</span>
										</div>
										<div className="flex items-center gap-2 text-muted-foreground">
											<Users className="h-4 w-4" />
											<span>{project._count?.members || 0} miembros</span>
										</div>
									</div>

									{/* Due Date */}
									{endDate && isValid(endDate) && (
										<div
											className={cn(
												'flex items-center gap-2 text-sm',
												isOverdue ? 'text-red-600' : 'text-muted-foreground',
											)}
										>
											<Calendar className="h-4 w-4" />
											<span>
												Finaliza:{' '}
												{format(endDate, 'dd MMM yyyy', { locale: es })}
											</span>
											{isOverdue && <span className="text-xs">(Vencido)</span>}
										</div>
									)}

									{/* Team Members Preview */}
									{project.members && project.members.length > 0 && (
										<div className="flex items-center gap-2">
											<div className="flex -space-x-2">
												{project.members.slice(0, 3).map((member) => (
													<div
														key={member.id}
														className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
													>
														{member.name?.charAt(0).toUpperCase()}
													</div>
												))}
												{project.members.length > 3 && (
													<div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-muted-foreground">
														+{project.members.length - 3}
													</div>
												)}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)
					})}
				</div>
			)}

			{/* Project Dialog */}
			<ProjectDialog
				project={selectedProject || undefined}
				open={showProjectDialog}
				onOpenChange={setShowProjectDialog}
				onSave={handleSaveProject}
				availableMembers={availableMembers}
			/>
		</div>
	)
}