'use client'

import { useState, useEffect } from 'react'
import {
	CreateProjectForm,
	ProjectWithRelations,
	UpdateProjectForm,
	User,
} from '@/types'
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

import { z } from 'zod'
import { toast } from '@/hooks/use-toast'
import { CreateProjectSchema } from '@/lib/validation'
import { useSession } from 'next-auth/react'

interface ProjectDialogProps {
	project?: ProjectWithRelations
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (project: CreateProjectForm) => Promise<void>
	availableMembers?: User[]
}

export function ProjectDialog({
	project,
	open,
	onOpenChange,
	onSave,
}: ProjectDialogProps) {
	const { data: session } = useSession()
	const [formData, setFormData] = useState<UpdateProjectForm>({
		name: '',
		description: '',
		slug: '',
		color: '',
		companyId: '',
		ownerId: '',
	})

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (project) {
			setFormData({
				name: project.name,
				description: project.description,
				slug: project.slug,
				color: project.color,
				companyId: project.companyId,
				ownerId: project.ownerId,
			})
		} else {
			setFormData({
				name: '',
				description: '',
				slug: '',
				color: '',
				companyId: '',
				ownerId: '',
			})
		}
		setErrors({})
	}, [project, open])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setErrors({})
		setIsLoading(true)

		try {
			const validatedData = CreateProjectSchema.parse({
				id: project?.id,
				name: formData.name,
				description: formData.description,
				slug: formData.slug,
				color: formData.color,
				companyId: session?.user.companyId,
				ownerId: session?.user.id,
			})

			await onSave({
				...validatedData,
				id: project?.id,
			})

			onOpenChange(false)
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string> = {}
				error.issues.forEach((err) => {
					if (err.path[0]) {
						fieldErrors[err.path[0] as string] = err.message
					}
				})
				setErrors(fieldErrors)
				toast({
					title: 'Error de validación',
					description: 'Por favor corrige los errores en el formulario.',
					variant: 'destructive',
				})
			}
		} finally {
			setIsLoading(false)
		}
	}

	const addMember = async (userId: string) => {
		await fetch('/api/team/member', {
			method: 'POST',
		})
	}

	const removeMember = async (memberId: string) => {
		await fetch(`/api/team/member/${memberId}`, {
			method: 'DELETE',
		})

		toast({
			title: 'Miembro eliminado',
			description: 'El miembro ha sido eliminado del equipo',
		})
	}

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
								value={formData.description ?? ''}
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

						<div>
							<Label htmlFor="slug">Slug del proyecto *</Label>
							<Input
								id="slug"
								value={formData.slug}
								onChange={(e) =>
									setFormData({ ...formData, slug: e.target.value })
								}
								className={errors.slug ? 'border-red-500' : ''}
								placeholder="Ej: www.miproyecto.com"
							/>
							{errors.slug && (
								<p className="text-sm text-red-500 mt-1">{errors.slug}</p>
							)}
						</div>

						<div>
							<Label htmlFor="color">Nombre del proyecto *</Label>
							<Input
								id="color"
								value={formData.color}
								onChange={(e) =>
									setFormData({ ...formData, color: e.target.value })
								}
								className={errors.color ? 'border-red-500' : ''}
								placeholder="Ej: hex, rgb, etc."
							/>
							{errors.color && (
								<p className="text-sm text-red-500 mt-1">{errors.color}</p>
							)}
						</div>
					</div>
					{/*
					 Team Members 
					<div>
						<Label className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Miembros del equipo
						</Label>

						 Selected Members
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

						Add Members 
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
					*/}
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
