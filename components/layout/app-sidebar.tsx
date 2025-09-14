'use client'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
	CheckIcon,
	DashboardIcon,
	RocketIcon,
	PersonIcon,
	ExitIcon,
	GearIcon,
} from '@radix-ui/react-icons'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { usePathname } from 'next/navigation'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { ChevronUpIcon, User2 } from 'lucide-react'
import { ThemeToggle } from '../theme-toggle'

export function AppSidebar() {
	const { data: session } = useSession()
	const pathname = usePathname()
	const router = useRouter()

	const handleLogout = async () => {
		try {
			await signOut()
			router.push('/')
		} catch (error) {
			console.error('Error logging out:', error)
		}
	}
	const goto = () => {
		router.push('/dashboard/settings')
	}

	// Menu items.
	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
		{ name: 'Proyectos', href: '/dashboard/projects', icon: RocketIcon },
		{ name: 'Equipo', href: '/dashboard/team', icon: PersonIcon },
	]

	return (
		<Sidebar variant="inset" collapsible="offcanvas">
			<SidebarHeader className="flex items-center justify-between h-16 px-6 border-b">
				<div className="flex items-center space-x-2">
					<div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
						<CheckIcon className="h-5 w-5 text-white" />
					</div>
					<span className="text-xl font-bold text-gray-900">TaskFlow</span>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-sm text-gray-500">
						Empresa
					</SidebarGroupLabel>
					<SidebarGroupContent className="font-medium text-gray-900 text-center">
						{session?.user?.company.name || 'Nombre de la Empresa'}
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Rutas</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigation.map((item) => (
								<SidebarMenuItem key={item.name}>
									<SidebarMenuButton asChild isActive={pathname === item.href}>
										<a href={item.href}>
											<item.icon />
											<span>{item.name}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<User2 className="mr-2 h-4 w-4" />
									<span className="flex-1 text-left">
										{session?.user?.name}
									</span>
									<ChevronUpIcon className="ml-2 h-4 w-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent side="top">
								<DropdownMenuItem asChild>
									<ThemeToggle />
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Button
										onClick={goto}
										variant="ghost"
										size="sm"
										className="w-full justify-start"
									>
										<GearIcon className="mr-2 h-4 w-4" />
										Configuración
									</Button>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Button
										onClick={handleLogout}
										variant="ghost"
										size="sm"
										className="w-full justify-start"
									>
										<ExitIcon className="mr-2 h-4 w-4" />
										Cerrar Sesión
									</Button>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
