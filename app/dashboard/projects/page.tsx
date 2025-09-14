'use client'

import { useState, useEffect } from 'react'
import { Project, User } from '@/types'
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectDialog } from '@/components/projects/ProjectDialog'
import {
	Plus,
	Search,
	FolderOpen,
	Archive,
	Edit,
	MoreHorizontal,
	Trash2,
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([])
	const [availableMembers, setAvailableMembers] = useState<User[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedProject, setSelectedProject] = useState<Project | null>(null)
	const [showProjectDialog, setShowProjectDialog] = useState(false)
	const [statusFilter, setStatusFilter] = useState<string>('all')

	const { loading, execute } = useApi<Project[]>()

	useEffect(() => {
		loadProjects()
		loadMembers()
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast.error('Error', {
				description: 'No se pudieron cargar los proyectos',
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
				toast.success('Proyecto actualizado', {
					description: 'Los cambios se han guardado correctamente',
				})
			} else {
				setProjects([savedProject, ...projects])
				toast.success('Proyecto creado', {
					description: 'El nuevo proyecto se ha creado correctamente',
				})
			}
		} catch (error) {
			console.log(error)
			toast.error('Error', {
				description: 'error',
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
			toast.success('Proyecto eliminado', {
				description: 'El proyecto se ha eliminado correctamente',
			})
		} catch (error) {
			console.log(error)
			toast.error('Error', {
				description: 'Error al eliminar el proyecto',
			})
		}
	}

	const filteredProjects = projects.filter((project) => {
		const matchesSearch =
			project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			project.description?.toLowerCase().includes(searchTerm.toLowerCase())

		return matchesSearch
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
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
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
						return (
							<Card
								key={project.id}
								className={cn(
									'hover:shadow-md transition-all duration-200 border-l-4 cursor-pointer',
								)}
								onClick={() =>
									(window.location.href = `/dashboard/projects/${project.id}`)
								}
							>
								<CardHeader className="pb-3">
									<CardTitle className="text-lg leading-tight line-clamp-1">
										{project.name}
									</CardTitle>
									<CardDescription className="line-clamp-2 mt-1">
										{project.description || 'Sin descripción'}
									</CardDescription>
									<CardAction>
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
											<DropdownMenuContent>
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
									</CardAction>
								</CardHeader>
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
