'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { CheckIcon } from '@radix-ui/react-icons'

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		companyName: '',
		companySlug: '',
	})
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			if (response.ok) {
				router.push('/login')
			} else {
				console.error('Error en el registro')
			}
		} catch (error) {
			console.error('Error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
			...(name === 'companyName' && {
				companySlug: value
					.toLowerCase()
					.replace(/\s+/g, '-')
					.replace(/[^a-z0-9-]/g, ''),
			}),
		}))
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="flex items-center justify-center space-x-2 mb-4">
						<div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
							<CheckIcon className="h-6 w-6 text-white" />
						</div>
						<span className="text-2xl font-bold text-gray-900">TaskFlow</span>
					</div>
					<h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
					<p className="text-gray-600">
						Regístrate para comenzar a gestionar tus proyectos
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Registro</CardTitle>
						<CardDescription>
							Crea tu cuenta y configura tu empresa
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="name"
									className="text-sm font-medium text-gray-700"
								>
									Nombre completo
								</label>
								<Input
									id="name"
									name="name"
									type="text"
									placeholder="Tu nombre"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="email"
									className="text-sm font-medium text-gray-700"
								>
									Email
								</label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="tu@email.com"
									value={formData.email}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="password"
									className="text-sm font-medium text-gray-700"
								>
									Contraseña
								</label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="••••••••"
									value={formData.password}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="border-t pt-4">
								<h3 className="font-medium text-gray-900 mb-3">
									Información de la empresa
								</h3>
								<div className="space-y-2">
									<label
										htmlFor="companyName"
										className="text-sm font-medium text-gray-700"
									>
										Nombre de la empresa
									</label>
									<Input
										id="companyName"
										name="companyName"
										type="text"
										placeholder="Mi Empresa"
										value={formData.companyName}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="space-y-2 mt-2">
									<label
										htmlFor="companySlug"
										className="text-sm font-medium text-gray-700"
									>
										URL de la empresa
									</label>
									<div className="flex">
										<span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
											taskflow.com/
										</span>
										<Input
											id="companySlug"
											name="companySlug"
											type="text"
											placeholder="mi-empresa"
											value={formData.companySlug}
											onChange={handleChange}
											className="rounded-l-none"
											required
										/>
									</div>
								</div>
							</div>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
							</Button>
						</form>
						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								¿Ya tienes una cuenta?{' '}
								<Link href="/login" className="text-blue-600 hover:underline">
									Inicia sesión aquí
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
