'use client'

import { useState } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	Building2,
	Globe,
	Users,
	Save,
	Upload,
	AlertTriangle,
} from 'lucide-react'
import { companySchema } from '@/lib/validation'
import { z } from 'zod'

interface Company {
	id: string
	name: string
	description?: string
	website?: string
	logo?: string
	industry?: string
	size?: string
	timezone: string
}

interface CompanySettingsProps {
	company: Company
	onUpdateCompany: (data: any) => Promise<void>
	onUploadLogo: (file: File) => Promise<string>
}

const industryOptions = [
	'Tecnología',
	'Consultoría',
	'Marketing',
	'Educación',
	'Salud',
	'Finanzas',
	'Manufactura',
	'Retail',
	'Medios',
	'Gobierno',
	'Sin ánimo de lucro',
	'Otro',
]

const sizeOptions = [
	{ value: '1-10', label: '1-10 empleados' },
	{ value: '11-50', label: '11-50 empleados' },
	{ value: '51-200', label: '51-200 empleados' },
	{ value: '201-500', label: '201-500 empleados' },
	{ value: '500+', label: 'Más de 500 empleados' },
]

const timezones = [
	{ value: 'America/New_York', label: 'Eastern Time (ET)' },
	{ value: 'America/Chicago', label: 'Central Time (CT)' },
	{ value: 'America/Denver', label: 'Mountain Time (MT)' },
	{ value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
	{ value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
	{ value: 'Europe/Paris', label: 'Central European Time (CET)' },
	{ value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
	{ value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
	{ value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
]

export function CompanySettings({
	company,
	onUpdateCompany,
	onUploadLogo,
}: CompanySettingsProps) {
	const [formData, setFormData] = useState({
		name: company.name || '',
		description: company.description || '',
		website: company.website || '',
		logo: company.logo || '',
		industry: company.industry || '',
		size: company.size || '',
		timezone: company.timezone || 'UTC',
	})

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)
	const [isUploadingLogo, setIsUploadingLogo] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setErrors({})
		setIsLoading(true)

		try {
			const validatedData = companySchema.parse(formData)
			await onUpdateCompany(validatedData)
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

	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		setIsUploadingLogo(true)
		try {
			const logoUrl = await onUploadLogo(file)
			setFormData({ ...formData, logo: logoUrl })
		} catch (error) {
			setErrors({ logo: 'Error al subir el logo' })
		} finally {
			setIsUploadingLogo(false)
		}
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Configuración de la Empresa</h1>
				<p className="text-muted-foreground">
					Gestiona la información y configuración de tu empresa
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Información de la Empresa
					</CardTitle>
					<CardDescription>
						Actualiza los detalles básicos de tu empresa
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Logo Section */}
						<div className="flex items-center gap-6">
							<Avatar className="h-20 w-20 rounded-lg">
								<AvatarImage src={formData.logo} className="object-cover" />
								<AvatarFallback className="rounded-lg text-lg bg-primary/10">
									<Building2 className="h-8 w-8" />
								</AvatarFallback>
							</Avatar>
							<div className="space-y-2">
								<Label>Logo de la empresa</Label>
								<div className="flex gap-2">
									<Input
										type="file"
										accept="image/*"
										onChange={handleLogoUpload}
										disabled={isUploadingLogo}
										className="hidden"
										id="logo-upload"
									/>
									<label htmlFor="logo-upload">
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={isUploadingLogo}
											asChild
										>
											<span>
												<Upload className="mr-2 h-4 w-4" />
												{isUploadingLogo ? 'Subiendo...' : 'Subir logo'}
											</span>
										</Button>
									</label>
								</div>
								<Input
									placeholder="O ingresa URL del logo"
									value={formData.logo}
									onChange={(e) =>
										setFormData({ ...formData, logo: e.target.value })
									}
									className="text-sm"
								/>
								{errors.logo && (
									<p className="text-sm text-red-500">{errors.logo}</p>
								)}
							</div>
						</div>

						{/* Company Details */}
						<div className="grid gap-6">
							<div>
								<Label htmlFor="company-name">Nombre de la empresa *</Label>
								<Input
									id="company-name"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className={errors.name ? 'border-red-500' : ''}
									placeholder="Ej: Mi Empresa SAS"
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
									placeholder="Describe tu empresa y lo que hace..."
									rows={3}
								/>
								{errors.description && (
									<p className="text-sm text-red-500 mt-1">
										{errors.description}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="website">Sitio web</Label>
								<Input
									id="website"
									type="url"
									value={formData.website}
									onChange={(e) =>
										setFormData({ ...formData, website: e.target.value })
									}
									className={errors.website ? 'border-red-500' : ''}
									placeholder="https://www.ejemplo.com"
								/>
								{errors.website && (
									<p className="text-sm text-red-500 mt-1">{errors.website}</p>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label>Industria</Label>
									<Select
										value={formData.industry}
										onValueChange={(value) =>
											setFormData({ ...formData, industry: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Seleccionar industria" />
										</SelectTrigger>
										<SelectContent>
											{industryOptions.map((industry) => (
												<SelectItem key={industry} value={industry}>
													{industry}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label>Tamaño de la empresa</Label>
									<Select
										value={formData.size}
										onValueChange={(value) =>
											setFormData({ ...formData, size: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Seleccionar tamaño" />
										</SelectTrigger>
										<SelectContent>
											{sizeOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div>
								<Label>Zona horaria de la empresa</Label>
								<Select
									value={formData.timezone}
									onValueChange={(value) =>
										setFormData({ ...formData, timezone: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{timezones.map((timezone) => (
											<SelectItem key={timezone.value} value={timezone.value}>
												{timezone.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-sm text-muted-foreground mt-1">
									Zona horaria predeterminada para todos los miembros del equipo
								</p>
							</div>
						</div>

						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
								<div>
									<h4 className="font-medium text-blue-800">
										Información importante
									</h4>
									<p className="text-sm text-blue-700 mt-1">
										Los cambios en la configuración de la empresa afectarán a
										todos los miembros del equipo.
									</p>
								</div>
							</div>
						</div>

						<Button type="submit" disabled={isLoading} className="w-full">
							<Save className="mr-2 h-4 w-4" />
							{isLoading ? 'Guardando...' : 'Guardar configuración'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
