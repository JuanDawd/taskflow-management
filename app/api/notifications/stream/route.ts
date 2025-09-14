import { NextRequest } from 'next/server'
import { addSSEConnection, removeSSEConnection } from '@/lib/sse-manager'

export async function GET(request: NextRequest) {
	const userId = request.nextUrl.searchParams.get('userId')

	if (!userId) {
		return new Response('User ID required', { status: 400 })
	}

	console.log('🔌 SSE connection attempt for userId:', userId)

	const stream = new ReadableStream({
		start(controller) {
			addSSEConnection(userId, controller)

			controller.enqueue(
				`data: ${JSON.stringify({
					type: 'connected',
					message: 'Notification stream connected',
				})}\n\n`,
			)
		},
		cancel() {
			removeSSEConnection(userId)
		},
	})

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	})
}
