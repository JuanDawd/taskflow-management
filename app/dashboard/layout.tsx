'use client'

import { useSession } from 'next-auth/react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import Header from '@/components/layout/header'

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { data: session } = useSession()

	if (!session) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	//< className="min-h-screen bg-gray-50">
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<div className="p-6 pt-2">
					<Header />
					<main className="pt-6 ">{children}</main>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
