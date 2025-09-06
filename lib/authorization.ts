import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getCurrentUser() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.email) {
		return null
	}

	return await db.user.findUnique({
		where: { email: session.user.email },
		include: {
			company: true,
			role: true,
		},
	})
}

export async function hasPermission(
	userId: string,
	action: string,
	resource?: string,
): Promise<boolean> {
	const user = await db.user.findUnique({
		where: { id: userId },
		include: { role: { include: { permissions: true } } },
	})

	if (!user?.role) return false

	// Check if user has the specific permission
	const hasPermission = user.role.permissions.some(
		(permission) => permission.name === `${action}:${resource || '*'}`,
	)

	// Check for admin role (has all permissions)
	const isAdmin = user.role.name === 'ADMIN'

	return hasPermission || isAdmin
}

export async function canAccessProject(
	userId: string,
	projectId: string,
): Promise<boolean> {
	const user = await db.user.findUnique({
		where: { id: userId },
		include: { company: true },
	})

	if (!user) return false

	const project = await db.project.findUnique({
		where: { id: projectId },
		include: { members: true },
	})

	if (!project) return false

	// Check if user belongs to the same company
	if (project.companyId !== user.companyId) return false

	// Check if user is a member of the project
	const isMember = project.members.some((member) => member.id === userId)

	return isMember
}

export async function canAccessTask(
	userId: string,
	taskId: string,
): Promise<boolean> {
	const task = await db.task.findUnique({
		where: { id: taskId },
		include: {
			project: {
				include: { members: true },
			},
		},
	})

	if (!task) return false

	return await canAccessProject(userId, task.projectId)
}
