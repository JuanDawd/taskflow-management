// Test notification directly (temporary endpoint)
// app/api/test-notification/route.ts
import { sendProjectNotification } from '@/lib/notification-service'

export async function POST(request: Request) {
	const { projectId } = await request.json()

	await sendProjectNotification({
		title: 'Test Notification',
		message: 'This is a test notification',
		type: 'TASK_CREATED',
		projectId,
	})

	return Response.json({ success: true })
}
