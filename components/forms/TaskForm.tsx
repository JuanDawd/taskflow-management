'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from 'lucide-react'
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
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Task } from '@prisma/client'
import { CreateTaskForm, Project, User } from '@/types'
import { CreateTaskSchema } from '@/lib/validation'
import { priorityLabels, statusLabels } from './constants'

interface TaskFormProps {
	task?: Task
	projectId?: string
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: CreateTaskForm) => Promise<void>
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
	const { toast } = useToast()

	const form = useForm<CreateTaskForm>({
		resolver: zodResolver(CreateTaskSchema),
		defaultValues: {
			title: '',
			description: '',
			status: 'TODO',
			priority: 'MEDIUM',
			projectId: projectId || '',
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
			})
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

	const handleSubmit = async (data: CreateTaskForm) => {
		try {
			setIsLoading(true)

			await onSubmit(data)

			toast({
				title: task ? 'Tarea actualizada' : 'Tarea creada',
				description: task
					? 'La tarea ha sido actualizada exitosamente'
					: 'La tarea ha sido creada exitosamente',
			})

			onOpenChange(false)
			form.reset()

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
												value={field.value ?? ''}
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
																{user.avatar ? (
																	<AvatarImage src={user.avatar} />
																) : (
																	<AvatarFallback className="text-xs">
																		{user.name
																			.split(' ')
																			.map((n) => n[0])
																			.join('')}
																	</AvatarFallback>
																)}
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
													selected={
														field.value instanceof Date
															? field.value
															: field.value
															? new Date(field.value)
															: undefined
													}
													onSelect={field.onChange}
													disabled={(date) => date < new Date()}
													autoFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
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
