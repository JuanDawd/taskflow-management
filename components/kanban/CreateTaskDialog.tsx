'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CreateTaskDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onTaskCreated: () => void
	projectId?: string
}

interface Project {
	id: string
	name: string
}

interface User {
	id: string
	name: string
}

export default function CreateTaskDialog({
	open,
	onOpenChange,
	onTaskCreated,
	projectId,
}: CreateTaskDialogProps) {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		projectId: projectId || '',
		assigneeId: '',
		priority: 'MEDIUM',
		dueDate: '',
	})
	const [projects, setProjects] = useState<Project[]>([])
	const [users, setUsers] = useState<User[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (open) {
			fetchProjects()
			fetchUsers()
		}
	}, [open])

	const fetchProjects = async () => {
		try {
			const response = await fetch('/api/projects')
			if (response.ok) {
				const data = await response.json()
				setProjects(data.projects)
			}
		} catch (error) {
			console.error('Error fetching projects:', error)
		}
	}

	const fetchUsers = async () => {
		try {
			const response = await fetch('/api/users')
			if (response.ok) {
				const data = await response.json()
				setUsers(data.users)
			}
		} catch (error) {
			console.error('Error fetching users:', error)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					assigneeId: formData.assigneeId || null,
					dueDate: formData.dueDate || null,
				}),
			})

			if (response.ok) {
				onTaskCreated()
				onOpenChange(false)
				setFormData({
					title: '',
					description: '',
					projectId: projectId || '',
					assigneeId: '',
					priority: 'MEDIUM',
					dueDate: '',
				})
			}
		} catch (error) {
			console.error('Error creating task:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Crear Nueva Tarea</DialogTitle>
					<DialogDescription>
						Completa los detalles de la nueva tarea
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="title">Título *</Label>
							<Input
								id="title"
								placeholder="Título de la tarea"
								value={formData.title}
								onChange={(e) => handleChange('title', e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Descripción</Label>
							<Textarea
								id="description"
								placeholder="Describe la tarea..."
								value={formData.description}
								onChange={(e) => handleChange('description', e.target.value)}
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Proyecto *</Label>
								<Select
									value={formData.projectId}
									onValueChange={(value) => handleChange('projectId', value)}
									required
								>
									<SelectTrigger>
										<SelectValue placeholder="Seleccionar proyecto" />
									</SelectTrigger>
									<SelectContent>
										{projects.map((project) => (
											<SelectItem key={project.id} value={project.id}>
												{project.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Prioridad</Label>
								<Select
									value={formData.priority}
									onValueChange={(value) => handleChange('priority', value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="LOW">Baja</SelectItem>
										<SelectItem value="MEDIUM">Media</SelectItem>
										<SelectItem value="HIGH">Alta</SelectItem>
										<SelectItem value="URGENT">Urgente</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Asignado a</Label>
								<Select
									value={formData.assigneeId}
									onValueChange={(value) => handleChange('assigneeId', value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Sin asignar" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">Sin asignar</SelectItem>
										{users.map((user) => (
											<SelectItem key={user.id} value={user.id}>
												{user.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="dueDate">Fecha límite</Label>
								<Input
									id="dueDate"
									type="date"
									value={formData.dueDate}
									onChange={(e) => handleChange('dueDate', e.target.value)}
								/>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Creando...' : 'Crear Tarea'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
