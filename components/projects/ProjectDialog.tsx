'use client'

import { useState, useEffect } from 'react'
import { Project, User } from '@/types'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, X, Plus, Users } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { projectSchema } from '@/lib/validation'
import { z } from 'zod'

interface ProjectDialogProps {
	project?: Project & { members?: User[] }
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (project: any) => Promise<void>
	availableMembers?: User[]
}

export function ProjectDialog({
	project,
	open,
	onOpenChange,
	onSave,
	availableMembers = [],
}: ProjectDialogProps) {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		status: 'ACTIVE' as const,
		priority: 'MEDIUM' as const,
		startDate: undefined as Date | undefined,
		endDate: undefined as Date | undefined,
		memberIds: [] as string[],
	})

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (project) {
			setFormData({
				name: project.name || '',
				description: project.description || '',
				status: project.status || 'ACTIVE',
				priority: project.priority || 'MEDIUM',
				startDate: project.startDate ? new Date(project.startDate) : undefined,
				endDate: project.endDate ? new Date(project.endDate) : undefined,
				memberIds: project.members?.map((m) => m.id) || [],
			})
		} else {
			setFormData({
				name: '',
				description: '',
				status: 'ACTIVE',
				priority: 'MEDIUM',
				startDate: undefined,
				endDate: undefined,
				memberIds: [],
			})
		}
		setErrors({})
	}, [project, open])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setErrors({})
		setIsLoading(true)

		try {
			const validatedData = projectSchema.parse({
				name: formData.name,
				description: formData.description,
				status: formData.status,
				priority: formData.priority,
				startDate: formData.startDate?.toISOString(),
				endDate: formData.endDate?.toISOString(),
			})

			await onSave({
				...validatedData,
				memberIds: formData.memberIds,
				id: project?.id,
			})

			onOpenChange(false)
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string> = {}
				error.errors.forEach((err) => {
					if (err.path[0]) {
						fieldErrors[err.path[0] as string] = err.message
					}
				})
				setErrors(fieldErrors)
			}
		} finally {
			setIsLoading(false)
		}
	}

	const addMember = (memberId: string) => {
		if (!formData.memberIds.includes(memberId)) {
			setFormData({
				...formData,
				memberIds: [...formData.memberIds, memberId],
			})
		}
	}

	const removeMember = (memberId: string) => {
		setFormData({
			...formData,
			memberIds: formData.memberIds.filter((id) => id !== memberId),
		})
	}

	const selectedMembers = availableMembers.filter((member) =>
		formData.memberIds.includes(member.id),
	)

	const unselectedMembers = availableMembers.filter(
		(member) => !formData.memberIds.includes(member.id),
	)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
					</DialogTitle>
					<DialogDescription>
						{project
							? 'Modifica los detalles del proyecto'
							: 'Crea un nuevo proyecto para organizar tus tareas'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic Information */}
					<div className="grid gap-4">
						<div>
							<Label htmlFor="name">Nombre del proyecto *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className={errors.name ? 'border-red-500' : ''}
								placeholder="Ej: Rediseño de la aplicación web"
							/>
							{errors.name && (
								<p className="text-sm text-red-500 mt-1">{errors.name}</p>
							)}
						</div>

						<div>
							<Label htmlFor="description">Descripción</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Describe el objetivo y alcance del proyecto..."
								rows={3}
							/>
							{errors.description && (
								<p className="text-sm text-red-500 mt-1">
									{errors.description}
								</p>
							)}
						</div>
					</div>

					{/* Status and Priority */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Estado</Label>
							<Select
								value={formData.status}
								onValueChange={(value: any) =>
									setFormData({ ...formData, status: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ACTIVE">Activo</SelectItem>
									<SelectItem value="COMPLETED">Completado</SelectItem>
									<SelectItem value="ARCHIVED">Archivado</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Prioridad</Label>
							<Select
								value={formData.priority}
								onValueChange={(value: any) =>
									setFormData({ ...formData, priority: value })
								}
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

					{/* Dates */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Fecha de inicio</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal',
											!formData.startDate && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{formData.startDate
											? format(formData.startDate, 'PPP', { locale: es })
											: 'Seleccionar fecha'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={formData.startDate}
										onSelect={(date) =>
											setFormData({ ...formData, startDate: date })
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div>
							<Label>Fecha de finalización</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal',
											!formData.endDate && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{formData.endDate
											? format(formData.endDate, 'PPP', { locale: es })
											: 'Seleccionar fecha'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={formData.endDate}
										onSelect={(date) =>
											setFormData({ ...formData, endDate: date })
										}
										initialFocus
										disabled={(date) =>
											formData.startDate ? date < formData.startDate : false
										}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Team Members */}
					<div>
						<Label className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Miembros del equipo
						</Label>

						{/* Selected Members */}
						{selectedMembers.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2 mb-3">
								{selectedMembers.map((member) => (
									<Badge
										key={member.id}
										variant="secondary"
										className="flex items-center gap-2"
									>
										<Avatar className="h-4 w-4">
											<AvatarImage src={member.avatar} />
											<AvatarFallback className="text-xs">
												{member.name
													?.split(' ')
													.map((n) => n[0])
													.join('')}
											</AvatarFallback>
										</Avatar>
										<span>{member.name}</span>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => removeMember(member.id)}
											className="h-4 w-4 p-0 hover:bg-transparent"
										>
											<X className="h-3 w-3" />
										</Button>
									</Badge>
								))}
							</div>
						)}

						{/* Add Members */}
						{unselectedMembers.length > 0 && (
							<Select onValueChange={addMember}>
								<SelectTrigger>
									<SelectValue placeholder="Seleccionar miembro del equipo" />
								</SelectTrigger>
								<SelectContent>
									{unselectedMembers.map((member) => (
										<SelectItem key={member.id} value={member.id}>
											<div className="flex items-center gap-2">
												<Avatar className="h-6 w-6">
													<AvatarImage src={member.avatar} />
													<AvatarFallback className="text-xs">
														{member.name
															?.split(' ')
															.map((n) => n[0])
															.join('')}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">{member.name}</div>
													<div className="text-xs text-muted-foreground">
														{member.email}
													</div>
												</div>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
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
								: project
								? 'Actualizar'
								: 'Crear Proyecto'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
