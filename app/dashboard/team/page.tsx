'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import {
	CreateTeamMemberForm,
	Project,
	TeamMember,
	TeamMemberRelations,
	UpdateTeamMemberForm,
} from '@/types'
import { MemberManagement } from '@/components/team/MemberManagement'
import { useApi } from '@/hooks/useApi'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { UserRole } from '@prisma/client'
import { toast } from 'sonner'

export default function TeamPage() {
	const { data: session } = useSession()
	const [members, setMembers] = useState<TeamMemberRelations[]>([])
	const [projects, setProjects] = useState<Project[]>([])

	const { loading, execute } = useApi<TeamMember[]>()

	useEffect(() => {
		loadMembers()
		loadProjects()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const loadMembers = async () => {
		try {
			await execute(async () => {
				const response = await fetch('/api/team/members')

				if (!response.ok) throw new Error('Error al cargar miembros')
				const data = await response.json()

				setMembers(data)

				return data
			})
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast.error('Error', {
				description: 'No se pudieron cargar los miembros del equipo',
			})
		}
	}

	const loadProjects = async () => {
		try {
			const response = await fetch('/api/projects')
			if (!response.ok) throw new Error('Error al cargar los proyectos')
			const data = await response.json()
			setProjects(data)
		} catch (error) {
			console.error('Error loading projects:', error)
		}
	}

	const currentUserRole = useMemo(
		() => session?.user.role || UserRole.USER,
		[session],
	)

	const handleInviteMember = async (inviteData: CreateTeamMemberForm) => {
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

			toast.success('Miembro añadio', {
				description: `Se ha añadido como nuevo miembro a ${inviteData.userId}`,
			})
		} catch (error) {
			console.error(error)

			toast.error('Error', {
				description: 'No se pudo añadir al nuevo miembro',
			})
		}
	}

	const handleUpdateMember = async (
		memberId: string,
		updateData: UpdateTeamMemberForm,
	) => {
		try {
			const response = await fetch(`/api/team/members/${memberId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updateData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Error al actualizar miembro')
			}

			const updatedMember = await response.json()
			setMembers(members.map((m) => (m.id === memberId ? updatedMember : m)))

			toast('Miembro actualizado', {
				description: 'Los cambios se han guardado correctamente',
			})
		} catch (error) {
			console.error(error)

			toast('Error', {
				description: 'error',
			})
		}
	}

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

			toast('Miembro eliminado', {
				description: 'El miembro ha sido eliminado del equipo',
			})
		} catch (error) {
			console.error(error)

			toast('Error', {
				description: 'error',
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
			onUpdateMember={handleUpdateMember}
			onRemoveMember={handleRemoveMember}
		/>
	)
}
