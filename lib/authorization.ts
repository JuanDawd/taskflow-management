import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { User, Company, UserRole } from '@prisma/client'

// Define the return type for getCurrentUser
type CurrentUser = User & {
	company: Company
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
	const session = await getServerSession(authOptions)

	if (!session?.user?.email) {
		return null
	}

	return await db.user.findUnique({
		where: { email: session.user.email },
		include: {
			company: true,
		},
	})
}

export async function hasPermission(userId: string): Promise<boolean> {
	try {
		const user = await db.user.findUnique({
			where: { id: userId },
			select: {
				role: true,
			},
		})

		if (!user) return false

		return user.role === UserRole.ADMIN
	} catch (error) {
		console.error('Error checking permissions:', error)
		return false
	}
}

export async function canAccessProject(
	userId: string,
	projectId: string,
): Promise<boolean> {
	try {
		const user = await db.user.findUnique({
			where: { id: userId },
			select: {
				companyId: true,
			},
		})

		if (!user) return false

		const project = await db.project.findUnique({
			where: { id: projectId },
			select: {
				companyId: true,
				members: {
					select: {
						userId: true,
					},
				},
			},
		})

		if (!project) return false

		// Check if user belongs to the same company
		if (project.companyId !== user.companyId) return false

		// Check if user is a member of the project
		const isMember = project.members.some((member) => member.userId === userId)

		return isMember
	} catch (error) {
		console.error('Error checking project access:', error)
		return false
	}
}

export async function canAccessTask(
	userId: string,
	taskId: string,
): Promise<boolean> {
	try {
		const task = await db.task.findUnique({
			where: { id: taskId },
			select: {
				projectId: true,
			},
		})

		if (!task) return false

		return await canAccessProject(userId, task.projectId)
	} catch (error) {
		console.error('Error checking task access:', error)
		return false
	}
}

export interface AuthContext {
	user?: CurrentUser
	params?: Record<string, string>
	[key: string]: unknown
}
