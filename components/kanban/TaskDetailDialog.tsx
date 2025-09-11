'use client'

import { useState, useEffect } from 'react'
import {
	Task,
	TaskComment,
	TaskCommentRelations,
	TaskWithRelations,
	User,
} from '@/types'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Calendar, MessageCircle, Send, Edit, Save, X } from 'lucide-react'
import { format, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

interface TaskDetailDialogProps {
	task: TaskWithRelations
	open: boolean
	onOpenChange: (open: boolean) => void
	onEdit?: (task: Task) => void
	onDelete?: (taskId: string) => void
	onMove?: (taskId: string, newStatus: string) => void
}

export function TaskDetailDialog({
	task,
	open,
	onOpenChange,
	onEdit,
}: TaskDetailDialogProps) {
	const { data: session } = useSession()
	const [isEditing, setIsEditing] = useState(false)
	const [editedTask, setEditedTask] = useState(task)
	const [newComment, setNewComment] = useState('')
	const [comments, setComments] = useState<TaskCommentRelations[]>(
		task.comments || [],
	)

	useEffect(() => {
		setEditedTask(task)
		setComments(task.comments || [])
	}, [task])

	const handleSave = async () => {
		onEdit?.(editedTask)
		setIsEditing(false)
	}

	const handleAddComment = async () => {
		if (!newComment.trim()) return

		try {
			const response = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: newComment,
					taskId: task.id,
					userId: session?.user.id,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al enviar invitación')
			}
			toast({
				title: 'Comentario añadido',
				description: `Se ha agregado el comentario a ${task.id}`,
			})
			console.log(response)
			const comment = {}
			//setComments([...comments, comment])
			setNewComment('')
		} catch (error) {
			console.log(error)

			toast({
				title: 'Error',
				description: 'error',
				variant: 'destructive',
			})
		}
	}

	const dueDate = task.dueDate ?? null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-start justify-between gap-4">
						{isEditing ? (
							<Input
								value={editedTask.title}
								onChange={(e) =>
									setEditedTask({ ...editedTask, title: e.target.value })
								}
								className="text-lg font-semibold"
							/>
						) : (
							<DialogTitle className="text-lg leading-tight">
								{task.title}
							</DialogTitle>
						)}

						<div className="flex gap-2">
							{isEditing ? (
								<>
									<Button size="sm" onClick={handleSave}>
										<Save className="h-4 w-4" />
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => setIsEditing(false)}
									>
										<X className="h-4 w-4" />
									</Button>
								</>
							) : (
								<Button
									size="sm"
									variant="outline"
									onClick={() => setIsEditing(true)}
								>
									<Edit className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					{/* Task Details */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Estado</Label>
							{isEditing ? (
								<Select
									value={editedTask.status}
									onValueChange={(value) =>
										setEditedTask({
											...editedTask,
											status: value as TaskDetailDialogProps['task']['status'],
										})
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="TODO">Por hacer</SelectItem>
										<SelectItem value="IN_PROGRESS">En progreso</SelectItem>
										<SelectItem value="REVIEW">Revisión</SelectItem>
										<SelectItem value="DONE">Completado</SelectItem>
									</SelectContent>
								</Select>
							) : (
								<div className="mt-1">
									<Badge>{task.status}</Badge>
								</div>
							)}
						</div>
					</div>

					{/* Due Date and Assignee */}
					<div className="grid grid-cols-2 gap-4">
						{dueDate && isValid(dueDate) && (
							<div>
								<Label>Fecha límite</Label>
								<div className="flex items-center gap-2 mt-1 text-sm">
									<Calendar className="h-4 w-4" />
									{format(dueDate, 'dd MMMM yyyy', { locale: es })}
								</div>
							</div>
						)}

						{task.assignee && (
							<div>
								<Label>Asignado a</Label>
								<div className="flex items-center gap-2 mt-1">
									<Avatar className="h-6 w-6">
										{task.assignee.avatar ? (
											<AvatarImage src={task.assignee.avatar} />
										) : (
											<AvatarFallback>
												{task.assignee.name
													?.split(' ')
													.map((n) => n[0])
													.join('')}
											</AvatarFallback>
										)}
									</Avatar>
									<span className="text-sm">{task.assignee.name}</span>
								</div>
							</div>
						)}
					</div>

					{/* Description */}
					<div>
						<Label>Descripción</Label>
						{isEditing ? (
							<Textarea
								value={editedTask.description || ''}
								onChange={(e) =>
									setEditedTask({ ...editedTask, description: e.target.value })
								}
								placeholder="Describe la tarea..."
								className="mt-1"
								rows={3}
							/>
						) : (
							<div className="mt-1 text-sm text-muted-foreground">
								{task.description || 'Sin descripción'}
							</div>
						)}
					</div>

					{/* Comments Section */}
					<div className="border-t pt-4">
						<div className="flex items-center gap-2 mb-4">
							<MessageCircle className="h-4 w-4" />
							<Label>Comentarios ({comments.length})</Label>
						</div>

						{/* Add Comment */}
						<div className="flex gap-2 mb-4">
							<Textarea
								placeholder="Añadir un comentario..."
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								className="flex-1"
								rows={2}
							/>
							<Button onClick={handleAddComment} disabled={!newComment.trim()}>
								<Send className="h-4 w-4" />
							</Button>
						</div>

						{/* Comments List */}
						<div className="space-y-3 max-h-60 overflow-y-auto">
							{comments.map((comment) => (
								<div
									key={comment.id}
									className="flex gap-3 p-3 bg-muted/50 rounded-lg"
								>
									<Avatar className="h-8 w-8">
										{comment.user?.avatar ? (
											<AvatarImage src={comment.user?.avatar} />
										) : (
											<AvatarFallback>
												{comment.user?.name
													?.split(' ')
													.map((n) => n[0])
													.join('')}
											</AvatarFallback>
										)}
									</Avatar>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-sm font-medium">
												{comment.user?.name}
											</span>
											<span className="text-xs text-muted-foreground">
												{format(comment.createdAt, 'dd MMM HH:mm', {
													locale: es,
												})}
											</span>
										</div>
										<p className="text-sm">{comment.content}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
