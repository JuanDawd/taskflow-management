'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@radix-ui/react-icons'
import TaskCard from './TaskCard'
import CreateTaskDialog from './CreateTaskDialog'

interface Task {
	id: string
	title: string
	description?: string
	status: string
	priority: string
	dueDate?: string
	assignee?: {
		id: string
		name: string
	}
	project: {
		id: string
		name: string
	}
}

interface KanbanBoardProps {
	projectId?: string
}

const COLUMNS = [
	{ id: 'BACKLOG', title: 'Backlog', color: 'bg-gray-100' },
	{ id: 'TODO', title: 'Por Hacer', color: 'bg-blue-100' },
	{ id: 'IN_PROGRESS', title: 'En Progreso', color: 'bg-yellow-100' },
	{ id: 'IN_REVIEW', title: 'En Revisión', color: 'bg-purple-100' },
	{ id: 'DONE', title: 'Completado', color: 'bg-green-100' },
]

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
	const [tasks, setTasks] = useState<Task[]>([])
	const [loading, setLoading] = useState(true)
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [draggedTask, setDraggedTask] = useState<string | null>(null)

	useEffect(() => {
		fetchTasks()
	}, [projectId])

	const fetchTasks = async () => {
		try {
			const url = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks'
			const response = await fetch(url)
			if (response.ok) {
				const data = await response.json()
				setTasks(data.tasks)
			}
		} catch (error) {
			console.error('Error fetching tasks:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDragStart = (e: React.DragEvent, taskId: string) => {
		setDraggedTask(taskId)
		e.dataTransfer.effectAllowed = 'move'
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'
	}

	const handleDrop = async (e: React.DragEvent, newStatus: string) => {
		e.preventDefault()

		if (!draggedTask) return

		try {
			const response = await fetch(`/api/tasks/${draggedTask}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			})

			if (response.ok) {
				setTasks((prevTasks) =>
					prevTasks.map((task) =>
						task.id === draggedTask ? { ...task, status: newStatus } : task,
					),
				)
			}
		} catch (error) {
			console.error('Error updating task status:', error)
		}

		setDraggedTask(null)
	}

	const getTasksByStatus = (status: string) => {
		return tasks.filter((task) => task.status === status)
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
					<h1 className="text-2xl font-bold text-gray-900">
						Tablero de Tareas
					</h1>
					<p className="text-gray-600">Gestiona y organiza tus tareas</p>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<PlusIcon className="mr-2 h-4 w-4" />
					Nueva Tarea
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 min-h-[600px]">
				{COLUMNS.map((column) => (
					<div
						key={column.id}
						className="space-y-4"
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, column.id)}
					>
						<Card
							className={`${column.color} border-2 border-dashed border-gray-300`}
						>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium flex items-center justify-between">
									{column.title}
									<span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full">
										{getTasksByStatus(column.id).length}
									</span>
								</CardTitle>
							</CardHeader>
						</Card>

						<div className="space-y-3">
							{getTasksByStatus(column.id).map((task) => (
								<TaskCard
									key={task.id}
									task={task}
									onDragStart={handleDragStart}
									onTaskUpdate={fetchTasks}
								/>
							))}
						</div>
					</div>
				))}
			</div>

			<CreateTaskDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onTaskCreated={fetchTasks}
				projectId={projectId}
			/>
		</div>
	)
}
