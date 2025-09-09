'use client'

import { usePathname } from 'next/navigation'
import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'

type NavigationItem = {
	header: string
	subheader: string
}

export default function Header() {
	const pathname = usePathname()

	const navigationHash: Record<string, NavigationItem> = {
		'/dashboard': {
			header: 'Dashboard',
			subheader: 'Resumen de tus proyectos y tareas',
		},
		'/dashboard/projects': {
			header: 'Proyectos',
			subheader: 'Gestiona y organiza todos tus proyectos',
		},
		'/dashboard/projects/*': {
			header: 'Gestión del proyecto',
			subheader: 'Administra las tareas y el progreso del proyecto',
		},
		'/dashboard/team': {
			header: 'Gestión del Equipo',
			subheader: 'Administra los miembros y permisos de tu equipo',
		},
	} as const

	const defaultHeader: NavigationItem = {
		header: 'Default',
		subheader: 'Default description',
	}

	const getNavigationItem = (): NavigationItem => {
		if (
			pathname.startsWith('/dashboard/projects/') &&
			pathname !== '/dashboard/projects'
		) {
			return navigationHash['/dashboard/projects/*']
		}
		return navigationHash[pathname] || defaultHeader
	}

	const headerData = getNavigationItem()

	return (
		<div className="flex items-center justify-start mb-6 gap-3">
			<SidebarTrigger variant="ghost" size="default" />
			<div>
				<h1 className="text-2xl font-bold text-accent-foreground">
					{headerData?.header}
				</h1>
				<p className="text-accent-foreground">{headerData?.subheader}</p>
			</div>
		</div>
	)
}
