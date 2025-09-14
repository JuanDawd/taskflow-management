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
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			})
			if (result?.ok) {
				router.push('/dashboard')
			} else {
				toast.error('Error de inicio de sesión', {
					description: result?.error || 'Ocurrió un error inesperado.',
				})
			}
		} catch (error) {
			console.error('Error:', error)
		} finally {
			setIsLoading(false)
		}
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
					<h1 className="text-2xl font-bold text-gray-900">
						Bienvenido de vuelta
					</h1>
					<p className="text-gray-600">Ingresa a tu cuenta para continuar</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Iniciar Sesión</CardTitle>
						<CardDescription>
							Ingresa tu email y contraseña para acceder a tu cuenta
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="email"
									className="text-sm font-medium text-gray-700"
								>
									Email
								</label>
								<Input
									id="email"
									type="email"
									placeholder="tu@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
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
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
							</Button>
						</form>
						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								¿No tienes una cuenta?{' '}
								<Link
									href="/register"
									className="text-blue-600 hover:underline"
								>
									Regístrate aquí
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
