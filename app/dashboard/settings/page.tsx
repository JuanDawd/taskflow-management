'use client'

import { useState, useEffect } from 'react'
import { UpdatePasswordForm, User } from '@/types'
import { UserSettings } from '@/components/settings/UserSettings'
import { CompanySettings } from '@/components/settings/CompanySettings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Building2, User as UserIcon } from 'lucide-react'
import { Company } from '@prisma/client'

export default function SettingsPage() {
	const { toast } = useToast()
	const [user, setUser] = useState<User | null>(null)
	const [company, setCompany] = useState<Company | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadUserData()
		loadCompanyData()
	}, [])

	const loadUserData = async () => {
		try {
			const response = await fetch('/api/user/profile')
			if (response.ok) {
				const userData = await response.json()
				setUser(userData)
			}
		} catch (error) {
			console.error('Error loading user data:', error)
		}
	}

	const loadCompanyData = async () => {
		try {
			const response = await fetch('/api/company')
			if (response.ok) {
				const companyData = await response.json()
				setCompany(companyData)
			}
		} catch (error) {
			console.error('Error loading company data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleUpdateProfile = async (profileData: User) => {
		try {
			const response = await fetch('/api/user/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(profileData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al actualizar perfil')
			}

			const updatedUser = await response.json()
			setUser(updatedUser)

			toast({
				title: 'Perfil actualizado',
				description: 'Los cambios se han guardado correctamente',
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: error,
				variant: 'destructive',
			})
		}
	}

	const handleUpdatePassword = async (passwordData: UpdatePasswordForm) => {
		try {
			const response = await fetch('/api/user/password', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(passwordData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al actualizar contraseña')
			}

			toast({
				title: 'Contraseña actualizada',
				description: 'Tu contraseña se ha cambiado correctamente',
			})
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			throw new Error('Error al actualizar contraseña')
		}
	}

	const handleUpdateCompany = async (companyData: unknown) => {
		try {
			const response = await fetch('/api/company', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(companyData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al actualizar empresa')
			}

			const updatedCompany = await response.json()
			setCompany(updatedCompany)

			toast({
				title: 'Empresa actualizada',
				description: 'Los cambios se han guardado correctamente',
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: error,
				variant: 'destructive',
			})
		}
	}

	const handleUploadLogo = async (file: File): Promise<string> => {
		// TODO: Implement file upload logic
		// This would typically upload to a cloud storage service
		return 'https://example.com/uploaded-logo.png'
	}

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="animate-pulse">
					<div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
					<div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
					<div className="h-12 bg-muted rounded mb-6"></div>
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<Card key={i}>
								<CardContent className="p-6">
									<div className="h-32 bg-muted rounded"></div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto">
			<Tabs defaultValue="user" className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Configuración</h1>
						<p className="text-muted-foreground">
							Gestiona tu perfil y configuración de la empresa
						</p>
					</div>
				</div>

				<TabsList className="grid w-full grid-cols-2 max-w-md">
					<TabsTrigger value="user" className="flex items-center gap-2">
						<UserIcon className="h-4 w-4" />
						Usuario
					</TabsTrigger>
					<TabsTrigger value="company" className="flex items-center gap-2">
						<Building2 className="h-4 w-4" />
						Empresa
					</TabsTrigger>
				</TabsList>

				<TabsContent value="user">
					{user && (
						<UserSettings
							user={user}
							onUpdateProfile={handleUpdateProfile}
							onUpdatePassword={handleUpdatePassword}
						/>
					)}
				</TabsContent>

				<TabsContent value="company">
					{company && (
						<CompanySettings
							company={company}
							onUpdateCompany={handleUpdateCompany}
							onUploadLogo={handleUploadLogo}
						/>
					)}
				</TabsContent>
			</Tabs>
		</div>
	)
}
