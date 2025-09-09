'use client'

import { useState } from 'react'
import { Task, TaskWithRelations } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	MoreHorizontal,
	Calendar,
	MessageCircle,
	Paperclip,
	Clock,
	Flag,
	Edit,
	Trash2,
} from 'lucide-react'
import { format, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { TaskDetailDialog } from './TaskDetailDialog'

interface TaskCardProps {
	task: TaskWithRelations
	onEdit?: (task: Task) => void
	onDelete?: (taskId: string) => void
	onMove?: (taskId: string, newStatus: string) => void
	onDragStart?: (e: React.DragEvent, taskId: string) => void
	className?: string
}

const priorityConfig = {
	LOW: { color: 'bg-gray-500', label: 'Baja' },
	MEDIUM: { color: 'bg-blue-500', label: 'Media' },
	HIGH: { color: 'bg-orange-500', label: 'Alta' },
	URGENT: { color: 'bg-red-500', label: 'Urgente' },
}

export function TaskCard({
	task,
	onEdit,
	onDelete,
	onMove,
	onDragStart,

	className,
}: TaskCardProps) {
	const [showDetails, setShowDetails] = useState(false)

	const dueDate = task.dueDate
	const isOverdue =
		dueDate &&
		isValid(dueDate) &&
		dueDate < new Date() &&
		task.status !== 'DONE'
	const isDueSoon =
		dueDate &&
		isValid(dueDate) &&
		dueDate < new Date(Date.now() + 24 * 60 * 60 * 1000) &&
		task.status !== 'DONE'

	const handleCardClick = (e: React.MouseEvent) => {
		if ((e.target as HTMLElement).closest('[data-no-drag]')) {
			return
		}
		setShowDetails(true)
	}

	const getHoursBetweenTaskAndNow = () => {
		const now = new Date()

		// Get the task due date (assuming task.dueDate is a Date object or date string)
		if (!dueDate || typeof dueDate !== 'string') return null

		const dueDateParsed = new Date(dueDate)
		if (!isValid(dueDateParsed)) return null

		// Calculate the difference in milliseconds
		const timeDifference = dueDateParsed.getTime() - now.getTime()

		// Convert milliseconds to hours (1 hour = 3,600,000 milliseconds)
		const hours = (timeDifference / (1000 * 60 * 60)).toFixed(0)

		return hours
	}

	return (
		<>
			<Card
				className={cn(
					'cursor-pointer transition-all duration-200 hover:shadow-md border-l-4',
					priorityConfig[
						task.priority as keyof typeof priorityConfig
					]?.color.replace('bg-', 'border-l-'),
					isOverdue && 'ring-2 ring-red-200 bg-red-50/50',
					className,
				)}
				onClick={handleCardClick}
			>
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between gap-2">
						<h3 className="font-medium text-sm leading-tight line-clamp-2">
							{task.title}
						</h3>
						<DropdownMenu>
							<DropdownMenuTrigger asChild data-no-drag>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
									onClick={(e) => e.stopPropagation()}
								>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => onEdit?.(task)}>
									<Edit className="mr-2 h-4 w-4" />
									Editar
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => onDelete?.(task.id)}
									className="text-red-600"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Eliminar
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{task.description && (
						<p className="text-xs text-muted-foreground line-clamp-2 mt-1">
							{task.description}
						</p>
					)}
				</CardHeader>

				<CardContent className="pt-0">
					{/* Due Date */}
					{dueDate && isValid(dueDate) && (
						<div
							className={cn(
								'flex items-center gap-1 text-xs mb-2',
								isOverdue
									? 'text-red-600'
									: isDueSoon
									? 'text-orange-600'
									: 'text-muted-foreground',
							)}
						>
							<Calendar className="h-3 w-3" />
							<span>{format(dueDate, 'dd MMM', { locale: es })}</span>
							{isOverdue && <span className="text-xs">(Vencida)</span>}
						</div>
					)}

					{/* Priority Badge */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className={cn(
									'text-xs py-0 px-2',
									priorityConfig[
										task.priority as keyof typeof priorityConfig
									]?.color.replace('bg-', 'text-white bg-'),
								)}
							>
								<Flag className="h-3 w-3 mr-1" />
								{
									priorityConfig[task.priority as keyof typeof priorityConfig]
										?.label
								}
							</Badge>
						</div>

						<div className="flex items-center gap-2">
							{/* Comments count */}
							{(task.comments?.length || 0) > 0 && (
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<MessageCircle className="h-3 w-3" />
									<span>{task?.comments?.length}</span>
								</div>
							)}

							{/* Attachments count */}
							{(task.attachments?.length || 0) > 0 && (
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Paperclip className="h-3 w-3" />
									<span>{task.attachments?.length}</span>
								</div>
							)}

							{/* Assignee avatar */}
							{task.assignee && (
								<Avatar className="h-6 w-6">
									{task.assignee.avatar ? (
										<AvatarImage src={task.assignee.avatar} />
									) : (
										<AvatarFallback className="text-xs">
											{task.assignee.name
												?.split(' ')
												.map((n) => n[0])
												.join('')}
										</AvatarFallback>
									)}
								</Avatar>
							)}
						</div>
					</div>

					{/* Time tracking */}
					{task.dueDate && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
							<Clock className="h-3 w-3" />
							<span>{getHoursBetweenTaskAndNow()}h estimadas</span>
						</div>
					)}
				</CardContent>
			</Card>

			<TaskDetailDialog
				task={task}
				open={showDetails}
				onOpenChange={setShowDetails}
				onEdit={onEdit}
				onDelete={onDelete}
				onMove={onMove}
			/>
		</>
	)
}
