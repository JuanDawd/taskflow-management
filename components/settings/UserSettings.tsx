'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
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
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	User as UserIcon,
	Bell,
	Shield,
	Globe,
	Camera,
	Save,
	AlertTriangle,
} from 'lucide-react'
import { userProfileSchema } from '@/lib/validation'
import { z } from 'zod'

interface UserSettingsProps {
	user: User & {
		bio?: string
		timezone?: string
		notifications?: {
			email: boolean
			push: boolean
			taskAssigned: boolean
			taskCompleted: boolean
			comments: boolean
		}
	}
	onUpdateProfile: (data: any) => Promise<void>
	onUpdatePassword: (data: {
		currentPassword: string
		newPassword: string
	}) => Promise<void>
}

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

export function UserSettings({
	user,
	onUpdateProfile,
	onUpdatePassword,
}: UserSettingsProps) {
	const [profileData, setProfileData] = useState({
		name: user.name || '',
		email: user.email || '',
		bio: user.bio || '',
		timezone: user.timezone || 'UTC',
		avatar: user.avatar || '',
		notifications: {
			email: true,
			push: true,
			taskAssigned: true,
			taskCompleted: true,
			comments: true,
			...user.notifications,
		},
	})

	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	})

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setErrors({})
		setIsLoading(true)

		try {
			const validatedData = userProfileSchema.parse(profileData)
			await onUpdateProfile(validatedData)
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

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setErrors({})

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setErrors({ confirmPassword: 'Las contraseñas no coinciden' })
			return
		}

		if (passwordData.newPassword.length < 6) {
			setErrors({
				newPassword: 'La contraseña debe tener al menos 6 caracteres',
			})
			return
		}

		setIsLoading(true)
		try {
			await onUpdatePassword({
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword,
			})

			setPasswordData({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			})
		} catch (error: any) {
			setErrors({
				currentPassword: error.message || 'Error al actualizar contraseña',
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Configuración</h1>
				<p className="text-muted-foreground">
					Gestiona tu perfil y preferencias de la cuenta
				</p>
			</div>

			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="profile" className="flex items-center gap-2">
						<UserIcon className="h-4 w-4" />
						Perfil
					</TabsTrigger>
					<TabsTrigger
						value="notifications"
						className="flex items-center gap-2"
					>
						<Bell className="h-4 w-4" />
						Notificaciones
					</TabsTrigger>
					<TabsTrigger value="security" className="flex items-center gap-2">
						<Shield className="h-4 w-4" />
						Seguridad
					</TabsTrigger>
					<TabsTrigger value="preferences" className="flex items-center gap-2">
						<Globe className="h-4 w-4" />
						Preferencias
					</TabsTrigger>
				</TabsList>

				{/* Profile Tab */}
				<TabsContent value="profile">
					<Card>
						<CardHeader>
							<CardTitle>Información del Perfil</CardTitle>
							<CardDescription>
								Actualiza tu información personal y foto de perfil
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleProfileSubmit} className="space-y-6">
								{/* Avatar Section */}
								<div className="flex items-center gap-6">
									<Avatar className="h-20 w-20">
										<AvatarImage src={profileData.avatar} />
										<AvatarFallback className="text-lg">
											{profileData.name
												?.split(' ')
												.map((n) => n[0])
												.join('')}
										</AvatarFallback>
									</Avatar>
									<div className="space-y-2">
										<Label htmlFor="avatar">URL de la foto</Label>
										<Input
											id="avatar"
											value={profileData.avatar}
											onChange={(e) =>
												setProfileData({
													...profileData,
													avatar: e.target.value,
												})
											}
											placeholder="https://ejemplo.com/foto.jpg"
										/>
										<Button type="button" variant="outline" size="sm">
											<Camera className="mr-2 h-4 w-4" />
											Cambiar foto
										</Button>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<Label htmlFor="name">Nombre completo *</Label>
										<Input
											id="name"
											value={profileData.name}
											onChange={(e) =>
												setProfileData({ ...profileData, name: e.target.value })
											}
											className={errors.name ? 'border-red-500' : ''}
										/>
										{errors.name && (
											<p className="text-sm text-red-500 mt-1">{errors.name}</p>
										)}
									</div>

									<div>
										<Label htmlFor="email">Email *</Label>
										<Input
											id="email"
											type="email"
											value={profileData.email}
											onChange={(e) =>
												setProfileData({
													...profileData,
													email: e.target.value,
												})
											}
											className={errors.email ? 'border-red-500' : ''}
										/>
										{errors.email && (
											<p className="text-sm text-red-500 mt-1">
												{errors.email}
											</p>
										)}
									</div>
								</div>

								<div>
									<Label htmlFor="bio">Biografía</Label>
									<Textarea
										id="bio"
										value={profileData.bio}
										onChange={(e) =>
											setProfileData({ ...profileData, bio: e.target.value })
										}
										placeholder="Cuéntanos sobre ti..."
										rows={3}
									/>
								</div>

								<Button type="submit" disabled={isLoading}>
									<Save className="mr-2 h-4 w-4" />
									{isLoading ? 'Guardando...' : 'Guardar cambios'}
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Notifications Tab */}
				<TabsContent value="notifications">
					<Card>
						<CardHeader>
							<CardTitle>Preferencias de Notificaciones</CardTitle>
							<CardDescription>
								Configura cómo y cuándo quieres recibir notificaciones
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<Label>Notificaciones por email</Label>
										<p className="text-sm text-muted-foreground">
											Recibe notificaciones importantes por correo electrónico
										</p>
									</div>
									<Switch
										checked={profileData.notifications.email}
										onCheckedChange={(checked) =>
											setProfileData({
												...profileData,
												notifications: {
													...profileData.notifications,
													email: checked,
												},
											})
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<Label>Notificaciones push</Label>
										<p className="text-sm text-muted-foreground">
											Recibe notificaciones en el navegador
										</p>
									</div>
									<Switch
										checked={profileData.notifications.push}
										onCheckedChange={(checked) =>
											setProfileData({
												...profileData,
												notifications: {
													...profileData.notifications,
													push: checked,
												},
											})
										}
									/>
								</div>

								<div className="border-t pt-4">
									<h4 className="font-medium mb-3">Tipos de notificaciones</h4>

									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<Label>Tareas asignadas</Label>
											<Switch
												checked={profileData.notifications.taskAssigned}
												onCheckedChange={(checked) =>
													setProfileData({
														...profileData,
														notifications: {
															...profileData.notifications,
															taskAssigned: checked,
														},
													})
												}
											/>
										</div>

										<div className="flex items-center justify-between">
											<Label>Tareas completadas</Label>
											<Switch
												checked={profileData.notifications.taskCompleted}
												onCheckedChange={(checked) =>
													setProfileData({
														...profileData,
														notifications: {
															...profileData.notifications,
															taskCompleted: checked,
														},
													})
												}
											/>
										</div>

										<div className="flex items-center justify-between">
											<Label>Nuevos comentarios</Label>
											<Switch
												checked={profileData.notifications.comments}
												onCheckedChange={(checked) =>
													setProfileData({
														...profileData,
														notifications: {
															...profileData.notifications,
															comments: checked,
														},
													})
												}
											/>
										</div>
									</div>
								</div>
							</div>

							<Button
								onClick={() => onUpdateProfile(profileData)}
								disabled={isLoading}
							>
								<Save className="mr-2 h-4 w-4" />
								Guardar preferencias
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Security Tab */}
				<TabsContent value="security">
					<Card>
						<CardHeader>
							<CardTitle>Seguridad de la Cuenta</CardTitle>
							<CardDescription>
								Actualiza tu contraseña y configuraciones de seguridad
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handlePasswordSubmit} className="space-y-6">
								<div>
									<Label htmlFor="currentPassword">Contraseña actual *</Label>
									<Input
										id="currentPassword"
										type="password"
										value={passwordData.currentPassword}
										onChange={(e) =>
											setPasswordData({
												...passwordData,
												currentPassword: e.target.value,
											})
										}
										className={errors.currentPassword ? 'border-red-500' : ''}
									/>
									{errors.currentPassword && (
										<p className="text-sm text-red-500 mt-1">
											{errors.currentPassword}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor="newPassword">Nueva contraseña *</Label>
									<Input
										id="newPassword"
										type="password"
										value={passwordData.newPassword}
										onChange={(e) =>
											setPasswordData({
												...passwordData,
												newPassword: e.target.value,
											})
										}
										className={errors.newPassword ? 'border-red-500' : ''}
									/>
									{errors.newPassword && (
										<p className="text-sm text-red-500 mt-1">
											{errors.newPassword}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor="confirmPassword">
										Confirmar nueva contraseña *
									</Label>
									<Input
										id="confirmPassword"
										type="password"
										value={passwordData.confirmPassword}
										onChange={(e) =>
											setPasswordData({
												...passwordData,
												confirmPassword: e.target.value,
											})
										}
										className={errors.confirmPassword ? 'border-red-500' : ''}
									/>
									{errors.confirmPassword && (
										<p className="text-sm text-red-500 mt-1">
											{errors.confirmPassword}
										</p>
									)}
								</div>

								<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
									<div className="flex items-start gap-3">
										<AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
										<div>
											<h4 className="font-medium text-yellow-800">
												Consejos de seguridad
											</h4>
											<ul className="text-sm text-yellow-700 mt-1 space-y-1">
												<li>• Usa al menos 8 caracteres</li>
												<li>• Incluye mayúsculas, minúsculas y números</li>
												<li>• Evita información personal obvia</li>
											</ul>
										</div>
									</div>
								</div>

								<Button type="submit" disabled={isLoading}>
									<Shield className="mr-2 h-4 w-4" />
									{isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Preferences Tab */}
				<TabsContent value="preferences">
					<Card>
						<CardHeader>
							<CardTitle>Preferencias Generales</CardTitle>
							<CardDescription>
								Configura tu zona horaria y otras preferencias
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div>
								<Label>Zona horaria</Label>
								<Select
									value={profileData.timezone}
									onValueChange={(value) =>
										setProfileData({ ...profileData, timezone: value })
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
									Se usa para mostrar fechas y horas correctamente
								</p>
							</div>

							<Button
								onClick={() => onUpdateProfile(profileData)}
								disabled={isLoading}
							>
								<Save className="mr-2 h-4 w-4" />
								Guardar preferencias
							</Button>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
