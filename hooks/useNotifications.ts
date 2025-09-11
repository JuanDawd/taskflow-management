import { useState, useEffect } from 'react'
import { NotificationManager } from '@/lib/notifications'
import { Notifications } from '@/types'

export function useNotifications() {
	const [notificationManager] = useState(() => new NotificationManager())
	const [notifications, setNotifications] = useState<Notifications[]>([])
	const [unreadCount, setUnreadCount] = useState(0)

	useEffect(() => {
		const handleNotifications = (newNotifications: Notifications[]) => {
			setNotifications(newNotifications)
			setUnreadCount(newNotifications.filter((n) => !n.read).length)
		}

		notificationManager.subscribe(handleNotifications)

		return () => {
			notificationManager.unsubscribe(handleNotifications)
		}
	}, [notificationManager])

	const markAsRead = (notificationId: string) => {
		notificationManager.markAsRead(notificationId)
	}

	const markAllAsRead = () => {
		notificationManager.markAllAsRead()
	}

	return {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		notificationManager,
	}
}
