'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	CheckIcon,
	DashboardIcon,
	RocketIcon,
	PersonIcon,
	ExitIcon,
	HamburgerMenuIcon,
} from '@radix-ui/react-icons'

interface User {
	id: string
	name: string
	email: string
	role: string
	company: {
		id: string
		name: string
		slug: string
	}
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const [user, setUser] = useState<User | null>(null)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch('/api/auth/me')
				if (response.ok) {
					const data = await response.json()
					setUser(data.user)
				} else {
					router.push('/login')
				}
			} catch (error) {
				console.error('Error fetching user:', error)
				router.push('/login')
			}
		}

		fetchUser()
	}, [router])

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' })
			router.push('/')
		} catch (error) {
			console.error('Error logging out:', error)
		}
	}

	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
		{ name: 'Proyectos', href: '/dashboard/projects', icon: RocketIcon },
		{ name: 'Equipo', href: '/dashboard/team', icon: PersonIcon },
	]

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
			>
				<div className="flex items-center justify-between h-16 px-6 border-b">
					<div className="flex items-center space-x-2">
						<div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<CheckIcon className="h-5 w-5 text-white" />
						</div>
						<span className="text-xl font-bold text-gray-900">TaskFlow</span>
					</div>
					<button onClick={() => setSidebarOpen(false)} className="lg:hidden">
						<HamburgerMenuIcon className="h-6 w-6" />
					</button>
				</div>

				<div className="p-6">
					<div className="mb-6">
						<p className="text-sm text-gray-500">Empresa</p>
						<p className="font-medium text-gray-900">{user.company.name}</p>
					</div>

					<nav className="space-y-2">
						{navigation.map((item) => {
							const isActive = pathname === item.href
							return (
								<Link
									key={item.name}
									href={item.href}
									className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
										isActive
											? 'bg-blue-100 text-blue-700'
											: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
									}`}
								>
									<item.icon className="mr-3 h-5 w-5" />
									{item.name}
								</Link>
							)
						})}
					</nav>
				</div>

				<div className="absolute bottom-0 w-full p-6 border-t">
					<div className="flex items-center mb-4">
						<div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
							<span className="text-sm font-medium text-gray-700">
								{user.name.charAt(0).toUpperCase()}
							</span>
						</div>
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-900">{user.name}</p>
							<p className="text-xs text-gray-500">{user.role}</p>
						</div>
					</div>
					<Button
						onClick={handleLogout}
						variant="ghost"
						size="sm"
						className="w-full justify-start"
					>
						<ExitIcon className="mr-2 h-4 w-4" />
						Cerrar Sesión
					</Button>
				</div>
			</div>

			{/* Main content */}
			<div className="lg:pl-64">
				{/* Top bar for mobile */}
				<div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
					<button onClick={() => setSidebarOpen(true)} className="p-2">
						<HamburgerMenuIcon className="h-6 w-6" />
					</button>
					<div className="flex items-center space-x-2">
						<div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
							<CheckIcon className="h-4 w-4 text-white" />
						</div>
						<span className="font-bold text-gray-900">TaskFlow</span>
					</div>
					<div></div>
				</div>

				{/* Page content */}
				<main className="p-6">{children}</main>
			</div>

			{/* Overlay for mobile */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				></div>
			)}
		</div>
	)
}
