import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface NotificationData {
	id: string
	title: string
	message: string
	type: string
}

export function useNotifications(userId: string | null) {
	const [isConnected, setIsConnected] = useState(false)
	const eventSourceRef = useRef<EventSource | null>(null)

	useEffect(() => {
		if (!userId) return

		const eventSource = new EventSource(
			`/api/notifications/stream?userId=${userId}`,
		)
		eventSourceRef.current = eventSource

		eventSource.onopen = () => {
			setIsConnected(true)
		}

		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data)

			if (data.type === 'notification') {
				const notification: NotificationData = data.data

				toast(notification.title, {
					description: notification.message,
				})
			}
		}

		eventSource.onerror = () => {
			setIsConnected(false)
		}

		return () => {
			eventSource.close()
			setIsConnected(false)
		}
	}, [userId])

	return { isConnected }
}
