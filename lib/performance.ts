import { cache } from 'react'
import { unstable_cache } from 'next/cache'

// Cache expensive database queries
export const getCachedTasks = unstable_cache(
	async (projectId: string, userId: string) => {
		const { prisma } = await import('@/lib/prisma')

		return await db.task.findMany({
			where: {
				projectId,
				OR: [
					{ assigneeId: userId },
					{ project: { members: { some: { id: userId } } } },
				],
			},
			include: {
				assignee: true,
				project: true,
				_count: { select: { comments: true } },
			},
			orderBy: { createdAt: 'desc' },
		})
	},
	['tasks'],
	{ revalidate: 300 }, // 5 minutes
)

export const getCachedProjects = unstable_cache(
	async (companyId: string) => {
		const { prisma } = await import('@/lib/prisma')

		return await db.project.findMany({
			where: {
				companyId,
				isActive: true,
			},
			include: {
				_count: {
					select: {
						tasks: true,
						members: true,
					},
				},
			},
			orderBy: { updatedAt: 'desc' },
		})
	},
	['projects'],
	{ revalidate: 600 }, // 10 minutes
)
