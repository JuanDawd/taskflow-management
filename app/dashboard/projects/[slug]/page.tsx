'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PersonIcon, GearIcon } from '@radix-ui/react-icons'

interface Project {
	id: string
	name: string
	description?: string
	color: string
	members: Array<{
		user: {
			id: string
			name: string
			role: string
		}
	}>
	_count: {
		tasks: number
	}
}

export default function ProjectDetailPage() {
	const params = useParams()
	const projectSlug = params.slug as string
	const [project, setProject] = useState<Project | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchProject()
	}, [projectSlug])

	const fetchProject = async () => {
		try {
			const response = await fetch(`/api/projects/${projectSlug}`)
			if (response.ok) {
				const data = await response.json()
				setProject(data.project)
			}
		} catch (error) {
			console.error('Error fetching project:', error)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	if (!project) {
		return (
			<div className="text-center py-16">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Proyecto no encontrado
				</h1>
				<p className="text-gray-600">
					El proyecto que buscas no existe o no tienes acceso a él.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Project Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div
						className="h-12 w-12 rounded-lg flex items-center justify-center"
						style={{ backgroundColor: project.color }}
					>
						<span className="text-white font-bold text-lg">
							{project.name.charAt(0).toUpperCase()}
						</span>
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
						{project.description && (
							<p className="text-gray-600">{project.description}</p>
						)}
					</div>
				</div>
				<Button variant="outline">
					<GearIcon className="mr-2 h-4 w-4" />
					Configuración
				</Button>
			</div>

			{/* Project Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600">
							Total de Tareas
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{project._count.tasks}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600">
							Miembros del Equipo
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{project.members.length}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-gray-600">
							Miembros del Proyecto
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<div className="flex -space-x-2">
								{project.members.slice(0, 5).map((member) => (
									<div
										key={member.user.id}
										className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white text-xs font-medium text-gray-700"
										title={member.user.name}
									>
										{member.user.name.charAt(0).toUpperCase()}
									</div>
								))}
								{project.members.length > 5 && (
									<div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white text-xs text-gray-600">
										+{project.members.length - 5}
									</div>
								)}
							</div>
							<Button variant="ghost" size="sm">
								<PersonIcon className="h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Kanban Board */}
			<KanbanBoard projectId={project.id} />
		</div>
	)
}
