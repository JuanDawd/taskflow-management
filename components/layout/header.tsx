'use client'

import { usePathname } from 'next/navigation'
import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'

export default function Header() {
	const pathname = usePathname()

	const navigation = [
		{
			header: 'Dashboard',
			href: '/dashboard',
			subheader: 'Resumen de tus proyectos y tareas',
		},
		{
			header: 'Proyectos',
			href: '/dashboard/projects',
			subheader: 'Gestiona y organiza todos tus proyectos',
		},
		{
			header: 'Gestión del Equipo',
			href: '/dashboard/team',
			subheader: 'Administra los miembros y permisos de tu equipo',
		},
	]

	const headerData = navigation.find((item) => pathname.includes(item.href))

	return (
		<div className="flex items-center justify-start mb-6 gap-3">
			<SidebarTrigger variant="ghost" size="default" />
			<div>
				<h1 className="text-2xl font-bold text-gray-900">
					{headerData?.header}
				</h1>
				<p className="text-gray-600">{headerData?.subheader}</p>
			</div>
		</div>
	)
}
