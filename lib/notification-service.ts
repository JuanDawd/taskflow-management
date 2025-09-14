// lib/notification-service.ts
import { db } from '@/lib/db' // adjust import path
import { sendNotificationViaSSE } from '@/lib/sse-manager'

export interface NotificationData {
	title: string
	message: string
	type: 'TASK_CREATED' | 'TASK_COMPLETED' | 'COMMENT_ADDED'
	projectId: string
	taskId?: string
	commentId?: string
}

export async function sendProjectNotification(data: NotificationData) {
	console.log('Send????')
	// Get all project members who want push or both notifications
	const projectMembers = await db.projectMember.findMany({
		where: {
			projectId: data.projectId,
			user: {
				notificationMethod: {
					in: ['PUSH', 'BOTH'],
				},
			},
		},
		include: {
			user: true,
		},
	})

	console.log(projectMembers)

	// Create notifications and send via SSE
	for (const member of projectMembers) {
		const notification = await db.notification.create({
			data: {
				title: data.title,
				message: data.message,
				userId: member.user.id,
			},
		})

		// Send via SSE for push notifications
		sendNotificationViaSSE(member.user.id, {
			id: notification.id,
			title: notification.title,
			message: notification.message,
			type: data.type,
		})
	}
}
