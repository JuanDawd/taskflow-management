import { db } from '@/lib/db'
import { sendNotificationViaSSE } from '@/lib/sse-manager'
import { sendNotificationEmail } from '@/lib/email-service'

export interface NotificationData {
	title: string
	message: string
	type: 'TASK_CREATED' | 'TASK_COMPLETED' | 'COMMENT_ADDED'
	projectId: string
	taskId?: string
	commentId?: string
}

export async function sendProjectNotification(data: NotificationData) {
	console.log('🔔 sendProjectNotification called with:', data)

	// Get all project members with their notification preferences
	const projectMembers = await db.projectMember.findMany({
		where: {
			projectId: data.projectId,
			user: {
				notificationMethod: {
					not: 'NONE', // Exclude users who don't want notifications
				},
			},
		},
		include: {
			user: true,
			project: true, // Include project info for email
		},
	})

	console.log('👥 Found project members:', projectMembers.length)

	// Process each member based on their notification preference
	for (const member of projectMembers) {
		const user = member.user
		const project = member.project

		console.log(
			`📋 Processing notifications for user: ${user.name} (${user.notificationMethod})`,
		)

		// Create notification record in database
		const notification = await db.notification.create({
			data: {
				title: data.title,
				message: data.message,
				userId: user.id,
			},
		})

		// Send based on user preference
		switch (user.notificationMethod) {
			case 'PUSH':
				console.log('📱 Sending PUSH notification to:', user.name)
				sendNotificationViaSSE(user.id, {
					id: notification.id,
					title: notification.title,
					message: notification.message,
					type: data.type,
				})
				break

			case 'EMAIL':
				console.log('📧 Sending EMAIL notification to:', user.email)
				try {
					await sendNotificationEmail({
						to: user.email,
						userName: user.name,
						title: data.title,
						message: data.message,
						type: data.type,
						projectName: project.name,
						taskTitle: data.taskId ? 'Task details...' : undefined, // You can fetch task details if needed
					})
				} catch (error) {
					console.error('❌ Failed to send email to:', user.email, error)
				}
				break

			case 'BOTH':
				console.log('📱📧 Sending BOTH notifications to:', user.name)

				// Send push notification
				sendNotificationViaSSE(user.id, {
					id: notification.id,
					title: notification.title,
					message: notification.message,
					type: data.type,
				})

				// Send email notification
				try {
					await sendNotificationEmail({
						to: user.email,
						userName: user.name,
						title: data.title,
						message: data.message,
						type: data.type,
						projectName: project.name,
						taskTitle: data.taskId ? 'Task details...' : undefined,
					})
				} catch (error) {
					console.error('❌ Failed to send email to:', user.email, error)
				}
				break

			default:
				console.log('⏸️ User has notifications disabled:', user.name)
				break
		}
	}

	console.log('✅ All notifications processed')
}
