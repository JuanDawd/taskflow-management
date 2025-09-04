'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	CalendarIcon,
	PersonIcon,
	DotsHorizontalIcon,
	Pencil1Icon,
	TrashIcon,
} from '@radix-ui/react-icons'
import { formatDate } from '@/lib/utils'

interface TaskCardProps {
	task: {
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
	onDragStart: (e: React.DragEvent, taskId: string) => void
	onTaskUpdate: () => void
}

export default function TaskCard({
	task,
	onDragStart,
	onTaskUpdate,
}: TaskCardProps) {
	const [showActions, setShowActions] = useState(false)

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'URGENT':
				return 'bg-red-500'
			case 'HIGH':
				return 'bg-orange-500'
			case 'MEDIUM':
				return 'bg-yellow-500'
			default:
				return 'bg-gray-500'
		}
	}

	const handleDelete = async () => {
		if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return

		try {
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				onTaskUpdate()
			}
		} catch (error) {
			console.error('Error deleting task:', error)
		}
	}

	return (
		<Card
			draggable
			onDragStart={(e) => onDragStart(e, task.id)}
			className="cursor-move hover:shadow-md transition-shadow group"
			onMouseEnter={() => setShowActions(true)}
			onMouseLeave={() => setShowActions(false)}
		>
			<CardContent className="p-4">
				<div className="flex items-start justify-between mb-3">
					<div className="flex-1">
						<h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
						{task.description && (
							<p className="text-sm text-gray-600 line-clamp-2">
								{task.description}
							</p>
						)}
					</div>
					<div className="flex items-center space-x-1">
						<div
							className={`w-2 h-2 rounded-full ${getPriorityColor(
								task.priority,
							)}`}
						></div>
						{showActions && (
							<div className="flex space-x-1">
								<Button size="icon" variant="ghost" className="h-6 w-6">
									<Pencil1Icon className="h-3 w-3" />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									className="h-6 w-6 text-red-600 hover:text-red-700"
									onClick={handleDelete}
								>
									<TrashIcon className="h-3 w-3" />
								</Button>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between text-xs text-gray-500">
					<span className="bg-gray-100 px-2 py-1 rounded">
						{task.project.name}
					</span>
					<div className="flex items-center space-x-2">
						{task.dueDate && (
							<div className="flex items-center space-x-1">
								<CalendarIcon className="h-3 w-3" />
								<span>{formatDate(task.dueDate)}</span>
							</div>
						)}
						{task.assignee && (
							<div className="flex items-center space-x-1">
								<PersonIcon className="h-3 w-3" />
								<span>{task.assignee.name}</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
