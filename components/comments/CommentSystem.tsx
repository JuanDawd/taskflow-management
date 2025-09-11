'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
	MessageCircle,
	Send,
	MoreHorizontal,
	Edit,
	Trash2,
	Reply,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { User } from '@/types'

interface Comment {
	id: string
	content: string
	taskId: string
	userId: string
	parentId: string | null
	createdAt: string
	updatedAt: string
	user?: User
	replies?: Comment[]
	likes?: number
	isLiked?: boolean
}

interface CommentSystemProps {
	comments: Comment[]
	currentUser: User
	onAddComment: (data: { content: string; parentId?: string }) => Promise<void>
	onEditComment: (commentId: string, content: string) => Promise<void>
	onDeleteComment: (commentId: string) => Promise<void>
}

export function CommentSystem({
	comments,
	currentUser,
	onAddComment,
	onEditComment,
	onDeleteComment,
}: CommentSystemProps) {
	const [newComment, setNewComment] = useState('')
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editContent, setEditContent] = useState('')
	const [replyingTo, setReplyingTo] = useState<string | null>(null)
	const [replyContent, setReplyContent] = useState('')
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)

	const handleAddComment = async (parentId?: string) => {
		const content = parentId ? replyContent : newComment
		setErrors({})
		setIsLoading(true)

		try {
			// Basic validation
			if (!content.trim()) {
				setErrors({ content: 'El comentario no puede estar vacío' })
				return
			}
			if (content.length > 500) {
				setErrors({
					content: 'El comentario debe tener menos de 500 caracteres',
				})
				return
			}

			await onAddComment({ content: content.trim(), parentId })

			if (parentId) {
				setReplyContent('')
				setReplyingTo(null)
			} else {
				setNewComment('')
			}
		} catch (error) {
			console.error(error)
			setErrors({ content: 'Error al enviar el comentario' })
		} finally {
			setIsLoading(false)
		}
	}

	const handleEditComment = async (commentId: string) => {
		setErrors({})
		setIsLoading(true)

		try {
			// Basic validation
			if (!editContent.trim()) {
				setErrors({ edit: 'El comentario no puede estar vacío' })
				return
			}
			if (editContent.length > 500) {
				setErrors({ edit: 'El comentario debe tener menos de 500 caracteres' })
				return
			}

			await onEditComment(commentId, editContent.trim())
			setEditingId(null)
			setEditContent('')
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			setErrors({ edit: 'Error al actualizar el comentario' })
		} finally {
			setIsLoading(false)
		}
	}

	const startEditing = (comment: Comment) => {
		setEditingId(comment.id)
		setEditContent(comment.content)
		setErrors({})
	}

	const cancelEditing = () => {
		setEditingId(null)
		setEditContent('')
		setErrors({})
	}

	const startReplying = (commentId: string) => {
		setReplyingTo(commentId)
		setReplyContent('')
		setErrors({})
	}

	const cancelReplying = () => {
		setReplyingTo(null)
		setReplyContent('')
		setErrors({})
	}

	const renderComment = (comment: Comment, depth = 0) => (
		<div
			key={comment.id}
			className={cn(
				'space-y-3',
				depth > 0 && 'ml-8 border-l-2 border-muted pl-4',
			)}
		>
			<div className="flex gap-3">
				<Avatar className="h-8 w-8">
					<AvatarImage src={comment.user?.avatar || undefined} />
					<AvatarFallback>
						{comment.user?.name
							?.split(' ')
							.map((n) => n[0])
							.join('') || 'U'}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 space-y-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="font-medium text-sm">
								{comment.user?.name || 'Usuario'}
							</span>
							<span className="text-xs text-muted-foreground">
								{format(parseISO(comment.createdAt), 'dd MMM HH:mm', {
									locale: es,
								})}
							</span>
							{comment.createdAt !== comment.updatedAt && (
								<Badge variant="outline" className="text-xs">
									Editado
								</Badge>
							)}
						</div>

						{comment.user?.id === currentUser.id && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => startEditing(comment)}>
										<Edit className="mr-2 h-4 w-4" />
										Editar
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<DropdownMenuItem
												className="text-red-600"
												onSelect={(e) => e.preventDefault()}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Eliminar
											</DropdownMenuItem>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													¿Eliminar comentario?
												</AlertDialogTitle>
												<AlertDialogDescription>
													Esta acción no se puede deshacer. El comentario será
													eliminado permanentemente.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => onDeleteComment(comment.id)}
													className="bg-red-600 hover:bg-red-700"
												>
													Eliminar
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>

					{/* Comment Content */}
					{editingId === comment.id ? (
						<div className="space-y-2">
							<Textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className={errors.edit ? 'border-red-500' : ''}
								rows={3}
								placeholder="Editar comentario..."
								maxLength={500}
							/>
							{errors.edit && (
								<p className="text-sm text-red-500">{errors.edit}</p>
							)}
							<div className="text-xs text-muted-foreground text-right">
								{editContent.length}/500
							</div>
							<div className="flex gap-2">
								<Button
									size="sm"
									onClick={() => handleEditComment(comment.id)}
									disabled={isLoading || !editContent.trim()}
								>
									Guardar
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={cancelEditing}
									disabled={isLoading}
								>
									Cancelar
								</Button>
							</div>
						</div>
					) : (
						<>
							<p className="text-sm whitespace-pre-wrap">{comment.content}</p>

							{/* Comment Actions */}
							<div className="flex items-center gap-4 text-xs text-muted-foreground">
								<Button
									variant="ghost"
									size="sm"
									className="h-6 px-2"
									onClick={() => startReplying(comment.id)}
								>
									<Reply className="h-3 w-3 mr-1" />
									Responder
								</Button>
							</div>
						</>
					)}

					{/* Reply Form */}
					{replyingTo === comment.id && (
						<div className="space-y-2 mt-3">
							<Textarea
								placeholder="Escribe tu respuesta..."
								value={replyContent}
								onChange={(e) => setReplyContent(e.target.value)}
								className={errors.content ? 'border-red-500' : ''}
								rows={2}
								maxLength={500}
							/>
							{errors.content && (
								<p className="text-sm text-red-500">{errors.content}</p>
							)}
							<div className="text-xs text-muted-foreground text-right">
								{replyContent.length}/500
							</div>
							<div className="flex gap-2">
								<Button
									size="sm"
									onClick={() => handleAddComment(comment.id)}
									disabled={isLoading || !replyContent.trim()}
								>
									<Send className="h-3 w-3 mr-1" />
									Responder
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={cancelReplying}
									disabled={isLoading}
								>
									Cancelar
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Replies */}
			{comment.replies && comment.replies.length > 0 && (
				<div className="space-y-3">
					{comment.replies.map((reply) => renderComment(reply, depth + 1))}
				</div>
			)}
		</div>
	)

	const topLevelComments = comments.filter((comment) => !comment.parentId)

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageCircle className="h-5 w-5" />
					Comentarios ({comments.length})
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Add Comment */}
				<div className="flex gap-3">
					<Avatar className="h-8 w-8">
						<AvatarImage src={currentUser.avatar || undefined} />
						<AvatarFallback>
							{currentUser.name
								?.split(' ')
								.map((n) => n[0])
								.join('') || 'U'}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 space-y-2">
						<Textarea
							placeholder="Añadir un comentario..."
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							className={errors.content ? 'border-red-500' : ''}
							rows={3}
							maxLength={500}
						/>
						{errors.content && (
							<p className="text-sm text-red-500">{errors.content}</p>
						)}
						<div className="flex items-center justify-between">
							<div className="text-xs text-muted-foreground">
								{newComment.length}/500
							</div>
							<Button
								onClick={() => handleAddComment()}
								disabled={isLoading || !newComment.trim()}
								size="sm"
							>
								<Send className="h-4 w-4 mr-1" />
								{isLoading ? 'Enviando...' : 'Comentar'}
							</Button>
						</div>
					</div>
				</div>

				{/* Comments List */}
				{topLevelComments.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No hay comentarios aún</p>
						<p className="text-sm">Sé el primero en comentar esta tarea</p>
					</div>
				) : (
					<div className="space-y-6">
						{topLevelComments.map((comment) => renderComment(comment))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
