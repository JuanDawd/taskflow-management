// lib/notification-triggers.ts
import { sendProjectNotification } from './notification-service'

export async function notifyTaskCreated(
	taskId: string,
	projectId: string,
	creatorName: string,
	taskTitle: string,
) {
	await sendProjectNotification({
		title: 'New Task Created',
		message: `${creatorName} created task: ${taskTitle}`,
		type: 'TASK_CREATED',
		projectId,
		taskId,
	})
}

export async function notifyTaskCompleted(
	taskId: string,
	projectId: string,
	completedBy: string,
	taskTitle: string,
) {
	await sendProjectNotification({
		title: 'Task Completed',
		message: `${completedBy} completed task: ${taskTitle}`,
		type: 'TASK_COMPLETED',
		projectId,
		taskId,
	})
}

export async function notifyCommentAdded(
	taskId: string,
	projectId: string,
	commenterName: string,
	taskTitle: string,
) {
	await sendProjectNotification({
		title: 'New Comment',
		message: `${commenterName} commented on: ${taskTitle}`,
		type: 'COMMENT_ADDED',
		projectId,
		taskId,
	})
}
