'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, Upload, X, Plus, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const taskFormSchema = z.object({
	title: z.string().min(1, 'El título es requerido').max(100),
	description: z.string().optional(),
	status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
	assigneeId: z.string().optional(),
	projectId: z.string().min(1, 'El proyecto es requerido'),
	dueDate: z.date().optional(),
	estimatedHours: z.number().min(0).optional(),
	tags: z.array(z.string()).default([]),
	attachments: z
		.array(
			z.object({
				name: z.string(),
				url: z.string(),
				size: z.number(),
				type: z.string(),
			}),
		)
		.default([]),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskFormProps {
	task?: any
	projectId?: string
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: TaskFormValues) => Promise<void>
}

interface User {
	id: string
	name: string
	email: string
	avatar?: string
}

interface Project {
	id: string
	name: string
}

export function TaskForm({
	task,
	projectId,
	open,
	onOpenChange,
	onSubmit,
}: TaskFormProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [users, setUsers] = useState<User[]>([])
	const [projects, setProjects] = useState<Project[]>([])
	const [tags, setTags] = useState<string[]>([])
	const [newTag, setNewTag] = useState('')
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
	const { toast } = useToast()

	const form = useForm<TaskFormValues>({
		resolver: zodResolver(taskFormSchema),
		defaultValues: {
			title: '',
			description: '',
			status: 'TODO',
			priority: 'MEDIUM',
			projectId: projectId || '',
			tags: [],
			attachments: [],
		},
	})

	useEffect(() => {
		if (task) {
			form.reset({
				title: task.title,
				description: task.description || '',
				status: task.status,
				priority: task.priority,
				assigneeId: task.assigneeId || '',
				projectId: task.projectId,
				dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
				estimatedHours: task.estimatedHours || undefined,
				tags: task.tags || [],
				attachments: task.attachments || [],
			})
			setTags(task.tags || [])
		}
	}, [task, form])

	useEffect(() => {
		if (open) {
			fetchUsers()
			fetchProjects()
		}
	}, [open])

	const fetchUsers = async () => {
		try {
			const response = await fetch('/api/users')
			if (response.ok) {
				const data = await response.json()
				setUsers(data)
			}
		} catch (error) {
			console.error('Error fetching users:', error)
		}
	}

	const fetchProjects = async () => {
		try {
			const response = await fetch('/api/projects')
			if (response.ok) {
				const data = await response.json()
				setProjects(data)
			}
		} catch (error) {
			console.error('Error fetching projects:', error)
		}
	}

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || [])
		const maxSize = 10 * 1024 * 1024 // 10MB
		const allowedTypes = [
			'image/',
			'application/pdf',
			'text/',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument',
		]

		const validFiles = files.filter((file) => {
			if (file.size > maxSize) {
				toast({
					title: 'Archivo muy grande',
					description: `${file.name} excede el límite de 10MB`,
					variant: 'destructive',
				})
				return false
			}

			const isAllowed = allowedTypes.some((type) => file.type.startsWith(type))
			if (!isAllowed) {
				toast({
					title: 'Tipo de archivo no permitido',
					description: `${file.name} no es un tipo de archivo permitido`,
					variant: 'destructive',
				})
				return false
			}

			return true
		})

		setUploadedFiles((prev) => [...prev, ...validFiles])
	}

	const removeFile = (index: number) => {
		setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
	}

	const addTag = () => {
		if (newTag.trim() && !tags.includes(newTag.trim())) {
			const updatedTags = [...tags, newTag.trim()]
			setTags(updatedTags)
			form.setValue('tags', updatedTags)
			setNewTag('')
		}
	}

	const removeTag = (tagToRemove: string) => {
		const updatedTags = tags.filter((tag) => tag !== tagToRemove)
		setTags(updatedTags)
		form.setValue('tags', updatedTags)
	}

	const handleSubmit = async (data: TaskFormValues) => {
		try {
			setIsLoading(true)

			// Upload files first if any
			const attachments = []
			if (uploadedFiles.length > 0) {
				for (const file of uploadedFiles) {
					const formData = new FormData()
					formData.append('file', file)

					const uploadResponse = await fetch('/api/upload', {
						method: 'POST',
						body: formData,
					})

					if (uploadResponse.ok) {
						const uploadResult = await uploadResponse.json()
						attachments.push({
							name: file.name,
							url: uploadResult.url,
							size: file.size,
							type: file.type,
						})
					}
				}
			}

			const taskData = {
				...data,
				tags,
				attachments: [...(data.attachments || []), ...attachments],
			}

			await onSubmit(taskData)

			toast({
				title: task ? 'Tarea actualizada' : 'Tarea creada',
				description: task
					? 'La tarea ha sido actualizada exitosamente'
					: 'La tarea ha sido creada exitosamente',
			})

			onOpenChange(false)
			form.reset()
			setTags([])
			setUploadedFiles([])
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Hubo un error al guardar la tarea',
				variant: 'destructive',
			})
		} finally {
			setIsLoading(false)
		}
	}

	const priorityColors = {
		LOW: 'bg-blue-100 text-blue-800',
		MEDIUM: 'bg-yellow-100 text-yellow-800',
		HIGH: 'bg-orange-100 text-orange-800',
		URGENT: 'bg-red-100 text-red-800',
	}

	const statusLabels = {
		TODO: 'Por hacer',
		IN_PROGRESS: 'En progreso',
		REVIEW: 'En revisión',
		DONE: 'Completado',
	}

	const priorityLabels = {
		LOW: 'Baja',
		MEDIUM: 'Media',
		HIGH: 'Alta',
		URGENT: 'Urgente',
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{task ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
					<DialogDescription>
						{task
							? 'Modifica los detalles de la tarea'
							: 'Completa la información para crear una nueva tarea'}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						{/* Basic Information */}
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Título *</FormLabel>
										<FormControl>
											<Input
												placeholder="Ingresa el título de la tarea"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Descripción</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe los detalles de la tarea"
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Project and Assignment */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="projectId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Proyecto *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona un proyecto" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{projects.map((project) => (
													<SelectItem key={project.id} value={project.id}>
														{project.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="assigneeId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Asignado a</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona un miembro" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="">Sin asignar</SelectItem>
												{users.map((user) => (
													<SelectItem key={user.id} value={user.id}>
														<div className="flex items-center gap-2">
															<Avatar className="h-6 w-6">
																<AvatarImage src={user.avatar} />
																<AvatarFallback className="text-xs">
																	{user.name
																		.split(' ')
																		.map((n) => n[0])
																		.join('')}
																</AvatarFallback>
															</Avatar>
															{user.name}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Status and Priority */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Estado</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona el estado" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(statusLabels).map(([value, label]) => (
													<SelectItem key={value} value={value}>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="priority"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Prioridad</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona la prioridad" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(priorityLabels).map(
													([value, label]) => (
														<SelectItem key={value} value={value}>
															<div className="flex items-center gap-2">
																<div
																	className={cn('w-2 h-2 rounded-full', {
																		'bg-blue-500': value === 'LOW',
																		'bg-yellow-500': value === 'MEDIUM',
																		'bg-orange-500': value === 'HIGH',
																		'bg-red-500': value === 'URGENT',
																	})}
																/>
																{label}
															</div>
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Due Date and Estimated Hours */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="dueDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Fecha límite</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className={cn(
															'w-full pl-3 text-left font-normal',
															!field.value && 'text-muted-foreground',
														)}
													>
														{field.value ? (
															format(field.value, 'PPP', { locale: es })
														) : (
															<span>Selecciona una fecha</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) => date < new Date()}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="estimatedHours"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Horas estimadas</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												min="0"
												step="0.5"
												{...field}
												onChange={(e) =>
													field.onChange(
														e.target.value
															? parseFloat(e.target.value)
															: undefined,
													)
												}
											/>
										</FormControl>
										<FormDescription>Tiempo estimado en horas</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Tags */}
						<div className="space-y-2">
							<FormLabel>Etiquetas</FormLabel>
							<div className="flex flex-wrap gap-2 mb-2">
								{tags.map((tag) => (
									<Badge key={tag} variant="secondary" className="gap-1">
										{tag}
										<button
											type="button"
											onClick={() => removeTag(tag)}
											className="ml-1 hover:bg-red-100 rounded-full p-0.5"
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
							</div>
							<div className="flex gap-2">
								<Input
									placeholder="Nueva etiqueta"
									value={newTag}
									onChange={(e) => setNewTag(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault()
											addTag()
										}
									}}
								/>
								<Button type="button" onClick={addTag} size="sm">
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* File Attachments */}
						<div className="space-y-2">
							<FormLabel>Archivos adjuntos</FormLabel>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
								<input
									type="file"
									multiple
									accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
									onChange={handleFileUpload}
									className="hidden"
									id="file-upload"
								/>
								<label
									htmlFor="file-upload"
									className="flex flex-col items-center gap-2 cursor-pointer"
								>
									<Upload className="h-8 w-8 text-gray-400" />
									<span className="text-sm text-gray-600">
										Haz clic para subir archivos o arrastra aquí
									</span>
									<span className="text-xs text-gray-400">
										Máximo 10MB por archivo. Formatos: imágenes, PDF, documentos
									</span>
								</label>
							</div>

							{/* Uploaded Files List */}
							{uploadedFiles.length > 0 && (
								<div className="space-y-2">
									{uploadedFiles.map((file, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-2 bg-gray-50 rounded"
										>
											<div className="flex items-center gap-2">
												<div className="text-sm font-medium">{file.name}</div>
												<div className="text-xs text-gray-500">
													{(file.size / 1024 / 1024).toFixed(2)} MB
												</div>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeFile(index)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}

							{/* Existing Attachments (for editing) */}
							{task?.attachments?.length > 0 && (
								<div className="space-y-2">
									<div className="text-sm font-medium">
										Archivos existentes:
									</div>
									{task.attachments.map((attachment: any, index: number) => (
										<div
											key={index}
											className="flex items-center justify-between p-2 bg-gray-50 rounded"
										>
											<div className="flex items-center gap-2">
												<div className="text-sm font-medium">
													{attachment.name}
												</div>
												<div className="text-xs text-gray-500">
													{(attachment.size / 1024 / 1024).toFixed(2)} MB
												</div>
											</div>
											<a
												href={attachment.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-800 text-sm"
											>
												Ver
											</a>
										</div>
									))}
								</div>
							)}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading
									? 'Guardando...'
									: task
									? 'Actualizar'
									: 'Crear tarea'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
