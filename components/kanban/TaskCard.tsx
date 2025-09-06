'use client'

import { useState } from 'react'
import { Task, User, Comment } from '@/types'
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	MoreHorizontal,
	Calendar,
	MessageCircle,
	Paperclip,
	User as UserIcon,
	Clock,
	Flag,
	Edit,
	Trash2,
} from 'lucide-react'
import { format, isValid, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { TaskDetailDialog } from './TaskDetailDialog'

interface TaskCardProps {
	task: Task & {
		assignee?: User
		comments?: Comment[]
		_count?: {
			comments: number
			attachments: number
		}
	}
	onEdit?: (task: Task) => void
	onDelete?: (taskId: string) => void
	onMove?: (taskId: string, newStatus: string) => void
	className?: string
}

const priorityConfig = {
	LOW: { color: 'bg-gray-500', label: 'Baja' },
	MEDIUM: { color: 'bg-blue-500', label: 'Media' },
	HIGH: { color: 'bg-orange-500', label: 'Alta' },
	URGENT: { color: 'bg-red-500', label: 'Urgente' },
}

const statusConfig = {
	TODO: { color: 'bg-gray-100 text-gray-700', label: 'Por hacer' },
	IN_PROGRESS: { color: 'bg-blue-100 text-blue-700', label: 'En progreso' },
	REVIEW: { color: 'bg-yellow-100 text-yellow-700', label: 'Revisión' },
	DONE: { color: 'bg-green-100 text-green-700', label: 'Completado' },
}

export function TaskCard({
	task,
	onEdit,
	onDelete,
	onMove,
	className,
}: TaskCardProps) {
	const [showDetails, setShowDetails] = useState(false)

	const dueDate = task.dueDate ? parseISO(task.dueDate) : null
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
					{/* Tags */}
					{task.tags && task.tags.length > 0 && (
						<div className="flex flex-wrap gap-1 mb-3">
							{task.tags.slice(0, 2).map((tag) => (
								<Badge key={tag} variant="secondary" className="text-xs py-0">
									{tag}
								</Badge>
							))}
							{task.tags.length > 2 && (
								<Badge variant="secondary" className="text-xs py-0">
									+{task.tags.length - 2}
								</Badge>
							)}
						</div>
					)}

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
							{(task._count?.comments || 0) > 0 && (
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<MessageCircle className="h-3 w-3" />
									<span>{task._count.comments}</span>
								</div>
							)}

							{/* Attachments count */}
							{(task._count?.attachments || 0) > 0 && (
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Paperclip className="h-3 w-3" />
									<span>{task._count.attachments}</span>
								</div>
							)}

							{/* Assignee avatar */}
							{task.assignee && (
								<Avatar className="h-6 w-6">
									<AvatarImage src={task.assignee.avatar} />
									<AvatarFallback className="text-xs">
										{task.assignee.name
											?.split(' ')
											.map((n) => n[0])
											.join('')}
									</AvatarFallback>
								</Avatar>
							)}
						</div>
					</div>

					{/* Time tracking */}
					{task.estimatedHours && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
							<Clock className="h-3 w-3" />
							<span>{task.estimatedHours}h estimadas</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Task Detail Dialog */}
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
