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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Building2, Save, Upload, AlertTriangle } from 'lucide-react'
import { companySchema, CompanyType } from '@/lib/validation'
import { z } from 'zod'

interface CompanySettingsProps {
	company: CompanyType
	onUpdateCompany: (data: CompanyType) => Promise<void>
	onUploadLogo: (file: File) => Promise<string>
}

export function CompanySettings({
	company,
	onUpdateCompany,
	onUploadLogo,
}: CompanySettingsProps) {
	const [formData, setFormData] = useState<CompanyType>({
		name: company.name || '',
		slug: company.slug || '',
		logo: company.logo || '',
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
				error.issues.forEach((err) => {
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
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
