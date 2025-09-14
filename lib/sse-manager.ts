declare global {
	var sseConnections: Map<string, ReadableStreamDefaultController> | undefined
}

const connections =
	globalThis.sseConnections ??
	new Map<string, ReadableStreamDefaultController>()
if (process.env.NODE_ENV === 'development') {
	globalThis.sseConnections = connections
}

export function addSSEConnection(
	userId: string,
	controller: ReadableStreamDefaultController,
) {
	connections.set(userId, controller)
}

export function removeSSEConnection(userId: string) {
	connections.delete(userId)
}

export function sendNotificationViaSSE(
	userId: string,
	notification: {
		id: string
		title: string
		message: string
		type: string
	},
) {
	const controller = connections.get(userId)
	if (controller) {
		try {
			controller.enqueue(
				`data: ${JSON.stringify({
					type: 'notification',
					data: notification,
				})}\n\n`,
			)
		} catch (error) {
			console.error('❌ Error sending notification:', error)
			connections.delete(userId)
		}
	} else {
		console.log('❌ [CRITICAL] No controller found for userId:', userId)
	}
}
