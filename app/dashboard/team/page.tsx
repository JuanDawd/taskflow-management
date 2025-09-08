'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, Project } from '@/types'
import { MemberManagement } from '@/components/team/MemberManagement'
import { useApi } from '@/hooks/useApi'
import { useToast } from '@/hooks/use-toast'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { MemberInvite } from '@/lib/validation'

interface TeamMember extends User {
	role: 'ADMIN' | 'MEMBER' | 'VIEWER'
	joinedAt: string
	projects?: Project[]
}

export default function TeamPage() {
	const { data: session } = useSession()
	const { toast } = useToast()
	const [members, setMembers] = useState<TeamMember[]>([])
	const [projects, setProjects] = useState<Project[]>([])
	const [currentUserRole, setCurrentUserRole] = useState<
		'ADMIN' | 'MEMBER' | 'VIEWER'
	>('MEMBER')

	const { loading, execute } = useApi<TeamMember[]>()

	useEffect(() => {
		loadMembers()
		loadProjects()
	}, [])

	const loadMembers = async () => {
		try {
			await execute(async () => {
				const response = await fetch('/api/team/members')
				if (!response.ok) throw new Error('Error al cargar miembros')
				const data = await response.json()
				setMembers(data)

				// Get current user role
				const currentMember = data.find(
					(m: TeamMember) => m.id === session?.user?.id,
				)
				if (currentMember) {
					setCurrentUserRole(currentMember.role)
				}

				return data
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'No se pudieron cargar los miembros del equipo',
				variant: 'destructive',
			})
		}
	}

	const loadProjects = async () => {
		try {
			const response = await fetch('/api/projects')
			if (response.ok) {
				const data = await response.json()
				setProjects(data)
			}
		} catch (error) {
			console.error('Error loading projects:', error)
		}
	}

	const handleInviteMember = async (inviteData: MemberInvite) => {
		try {
			const response = await fetch('/api/team/members', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(inviteData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al enviar invitación')
			}

			toast({
				title: 'Invitación enviada',
				description: `Se ha enviado una invitación a ${inviteData.email}`,
			})
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	// const handleUpdateMember = async (memberId: string, updateData: any) => {
	// 	try {
	// 		const response = await fetch(`/api/team/members/${memberId}`, {
	// 			method: 'PUT',
	// 			headers: { 'Content-Type': 'application/json' },
	// 			body: JSON.stringify(updateData),
	// 		})

	// 		if (!response.ok) {
	// 			const errorData = await response.json()
	// 			throw new Error(errorData.error || 'Error al actualizar miembro')
	// 		}

	// 		const updatedMember = await response.json()
	// 		setMembers(members.map((m) => (m.id === memberId ? updatedMember : m)))

	// 		toast({
	// 			title: 'Miembro actualizado',
	// 			description: 'Los cambios se han guardado correctamente',
	// 		})
	// 	} catch (error: any) {
	// 		toast({
	// 			title: 'Error',
	// 			description: error.message,
	// 			variant: 'destructive',
	// 		})
	// 	}
	// }

	const handleRemoveMember = async (memberId: string) => {
		try {
			const response = await fetch(`/api/team/members/${memberId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al eliminar miembro')
			}

			setMembers(members.filter((m) => m.id !== memberId))

			toast({
				title: 'Miembro eliminado',
				description: 'El miembro ha sido eliminado del equipo',
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			})
		}
	}

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
					<div className="h-4 bg-muted rounded w-1/2"></div>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-16 bg-muted rounded"></div>
							</CardHeader>
							<CardContent>
								<div className="h-12 bg-muted rounded"></div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		)
	}

	return (
		<MemberManagement
			members={members}
			projects={projects}
			currentUserRole={currentUserRole}
			onInviteMember={handleInviteMember}
			// onUpdateMember={handleUpdateMember}
			onRemoveMember={handleRemoveMember}
		/>
	)
}
