'use client'

import { useState } from 'react'
import {
	User,
	Project,
	TeamMember,
	CreateTeamMemberForm,
	UpdateTeamMemberForm,
	TeamMemberRelations,
} from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
	MoreHorizontal,
	UserIcon,
	Edit,
	Trash2,
	UserPlus,
	Search,
	Crown,
} from 'lucide-react'
import { z } from 'zod'
import { CreateTeamMemberSchema } from '@/lib/validation'

interface MemberManagementProps {
	members: TeamMemberRelations[]
	projects: Project[]
	onInviteMember: (data: CreateTeamMemberForm) => Promise<void>
	onRemoveMember: (memberId: string) => Promise<void>
	currentUserRole: User['role']
	onUpdateMember: (
		memberId: string,
		updateData: UpdateTeamMemberForm,
	) => Promise<void>
}

const roleConfig = {
	ADMIN: { label: 'Administrador', icon: Crown, color: 'bg-purple-500' },
	MEMBER: { label: 'Miembro', icon: UserIcon, color: 'bg-blue-500' },
}

export function MemberManagement({
	members,
	projects,
	onInviteMember,
	onRemoveMember,
	currentUserRole,
}: MemberManagementProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [showInviteDialog, setShowInviteDialog] = useState(false)
	const [inviteData, setInviteData] = useState({
		email: '',
		role: '' as TeamMember['role'],
		projectIds: [] as string[],
	})
	const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)

	const filteredMembers = members.filter(
		(member) =>
			member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.user?.email.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	const handleInvite = async (e: React.FormEvent) => {
		e.preventDefault()
		setInviteErrors({})
		setIsLoading(true)

		try {
			const validatedData = CreateTeamMemberSchema.parse(inviteData)
			await onInviteMember(validatedData)

			setShowInviteDialog(false)
			setInviteData({
				email: '',
				role: 'MEMBER',
				projectIds: [],
			})
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string> = {}
				error.issues.forEach((err) => {
					if (err.path[0]) {
						fieldErrors[err.path[0] as string] = err.message
					}
				})
				setInviteErrors(fieldErrors)
			}
		} finally {
			setIsLoading(false)
		}
	}

	const canManageMembers = currentUserRole === 'ADMIN'

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				{canManageMembers && (
					<Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
						<DialogTrigger asChild>
							<Button>
								<UserPlus className="mr-2 h-4 w-4" />
								Invitar Miembro
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Invitar Nuevo Miembro</DialogTitle>
								<DialogDescription>
									Envía una invitación por email para unirse al equipo
								</DialogDescription>
							</DialogHeader>

							<form onSubmit={handleInvite} className="space-y-4">
								<div>
									<Label htmlFor="email">Email *</Label>
									<Input
										id="email"
										type="email"
										value={inviteData.email}
										onChange={(e) =>
											setInviteData({ ...inviteData, email: e.target.value })
										}
										className={inviteErrors.email ? 'border-red-500' : ''}
										placeholder="usuario@ejemplo.com"
									/>
									{inviteErrors.email && (
										<p className="text-sm text-red-500 mt-1">
											{inviteErrors.email}
										</p>
									)}
								</div>

								<div>
									<Label>Rol</Label>
									<Select
										value={inviteData.role}
										onValueChange={(value: TeamMember['role']) =>
											setInviteData({ ...inviteData, role: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ADMIN">Administrador</SelectItem>
											<SelectItem value="MEMBER">Miembro</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label>Proyectos (Opcional)</Label>
									<Select
										onValueChange={(projectId) => {
											if (!inviteData.projectIds.includes(projectId)) {
												setInviteData({
													...inviteData,
													projectIds: [...inviteData.projectIds, projectId],
												})
											}
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Asignar a proyectos específicos" />
										</SelectTrigger>
										<SelectContent>
											{projects
												.filter((p) => !inviteData.projectIds.includes(p.id))
												.map((project) => (
													<SelectItem key={project.id} value={project.id}>
														{project.name}
													</SelectItem>
												))}
										</SelectContent>
									</Select>

									{inviteData.projectIds.length > 0 && (
										<div className="flex flex-wrap gap-1 mt-2">
											{inviteData.projectIds.map((projectId) => {
												const project = projects.find((p) => p.id === projectId)
												return project ? (
													<Badge
														key={projectId}
														variant="secondary"
														className="flex items-center gap-1"
													>
														{project.name}
														<Button
															size="sm"
															variant="ghost"
															onClick={() =>
																setInviteData({
																	...inviteData,
																	projectIds: inviteData.projectIds.filter(
																		(id) => id !== projectId,
																	),
																})
															}
															className="h-4 w-4 p-0 hover:bg-transparent"
														>
															×
														</Button>
													</Badge>
												) : null
											})}
										</div>
									)}
								</div>

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setShowInviteDialog(false)}
										disabled={isLoading}
									>
										Cancelar
									</Button>
									<Button type="submit" disabled={isLoading}>
										{isLoading ? 'Enviando...' : 'Enviar Invitación'}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				)}
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Buscar miembros..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Members Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredMembers.map((member) => {
					const roleInfo = roleConfig[member.role]
					const RoleIcon = roleInfo.icon

					return (
						<Card key={member.id} className="hover:shadow-md transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10">
											{member.user?.avatar ? (
												<AvatarImage src={member.user?.avatar} />
											) : (
												<AvatarFallback>
													{member.user?.name
														?.split(' ')
														.map((n) => n[0])
														.join('')}
												</AvatarFallback>
											)}
										</Avatar>
										<div>
											<h3 className="font-medium leading-none">
												{member.user?.name}
											</h3>
											<p className="text-sm text-muted-foreground mt-1">
												{member.user?.email}
											</p>
										</div>
									</div>

									{canManageMembers && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => {
														/* Edit member */
													}}
												>
													<Edit className="mr-2 h-4 w-4" />
													Editar
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<DropdownMenuItem
															className="text-red-600"
															onSelect={(e) => e.preventDefault()}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Eliminar
														</DropdownMenuItem>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																¿Eliminar miembro?
															</AlertDialogTitle>
															<AlertDialogDescription>
																Esta acción eliminará a {member.user?.name} del
																equipo. No podrá acceder a los proyectos ni
																tareas asignadas.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancelar</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => onRemoveMember(member.id)}
																className="bg-red-600 hover:bg-red-700"
															>
																Eliminar
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								</div>
							</CardHeader>

							<CardContent className="pt-0">
								<div className="flex items-center justify-between mb-3">
									<Badge
										variant="secondary"
										className={`${roleInfo.color} text-white flex items-center gap-1`}
									>
										<RoleIcon className="h-3 w-3" />
										{roleInfo.label}
									</Badge>

									<div className="text-xs text-muted-foreground">
										Desde{' '}
										{new Date(member.createdAt).toLocaleDateString('es-ES', {
											month: 'short',
											year: 'numeric',
										})}
									</div>
								</div>

								{/* {member.user && member.projects.length > 0 && (
									<div>
										<p className="text-xs text-muted-foreground mb-2">
											Proyectos ({member.projects.length})
										</p>
										<div className="flex flex-wrap gap-1">
											{member.projects.slice(0, 2).map((project) => (
												<Badge
													key={project.id}
													variant="outline"
													className="text-xs"
												>
													{project.name}
												</Badge>
											))}
											{member.projects.length > 2 && (
												<Badge variant="outline" className="text-xs">
													+{member.projects.length - 2} más
												</Badge>
											)}
										</div>
									</div>
								)} */}
							</CardContent>
						</Card>
					)
				})}
			</div>

			{filteredMembers.length === 0 && (
				<div className="text-center py-12">
					<UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium mb-2">
						No se encontraron miembros
					</h3>
					<p className="text-muted-foreground">
						{searchTerm
							? 'Intenta con otros términos de búsqueda'
							: 'Comienza invitando miembros a tu equipo'}
					</p>
				</div>
			)}
		</div>
	)
}
