'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusIcon, PersonIcon, CheckIcon } from '@radix-ui/react-icons'

interface Project {
	id: string
	name: string
	description?: string
	slug: string
	color: string
	_count: {
		tasks: number
		members: number
	}
	members: Array<{
		user: {
			id: string
			name: string
			role: string
		}
	}>
}

export default function ProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchProjects()
	}, [])

	const fetchProjects = async () => {
		try {
			const response = await fetch('/api/projects')
			if (response.ok) {
				const data = await response.json()
				setProjects(data.projects)
			}
		} catch (error) {
			console.error('Error fetching projects:', error)
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

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
					<p className="text-gray-600">Gestiona todos tus proyectos</p>
				</div>
				<Button>
					<PlusIcon className="mr-2 h-4 w-4" />
					Nuevo Proyecto
				</Button>
			</div>

			{projects.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16">
						<div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<CheckIcon className="h-8 w-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No hay proyectos
						</h3>
						<p className="text-gray-500 text-center mb-6">
							Comienza creando tu primer proyecto para organizar las tareas de
							tu equipo.
						</p>
						<Button>
							<PlusIcon className="mr-2 h-4 w-4" />
							Crear Primer Proyecto
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((project) => (
						<Card
							key={project.id}
							className="hover:shadow-lg transition-shadow"
						>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div
											className="h-4 w-4 rounded-full"
											style={{ backgroundColor: project.color }}
										></div>
										<CardTitle className="text-lg">{project.name}</CardTitle>
									</div>
								</div>
								{project.description && (
									<p className="text-sm text-gray-600 mt-2">
										{project.description}
									</p>
								)}
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-4 text-sm text-gray-600">
										<div className="flex items-center space-x-1">
											<CheckIcon className="h-4 w-4" />
											<span>{project._count.tasks} tareas</span>
										</div>
										<div className="flex items-center space-x-1">
											<PersonIcon className="h-4 w-4" />
											<span>{project._count.members} miembros</span>
										</div>
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex -space-x-2">
										{project.members.slice(0, 3).map((member, index) => (
											<div
												key={member.user.id}
												className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white text-xs font-medium text-gray-700"
												title={member.user.name}
											>
												{member.user.name.charAt(0).toUpperCase()}
											</div>
										))}
										{project.members.length > 3 && (
											<div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white text-xs text-gray-600">
												+{project.members.length - 3}
											</div>
										)}
									</div>

									<Link href={`/dashboard/projects/${project.slug}`}>
										<Button variant="outline" size="sm">
											Ver Proyecto
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}
