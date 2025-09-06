import { useState, useEffect } from 'react'
import { NotificationManager, Notification } from '@/lib/notifications'

export function useNotifications(wsUrl: string) {
	const [notificationManager] = useState(() => new NotificationManager(wsUrl))
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)

	useEffect(() => {
		const handleNotifications = (newNotifications: Notification[]) => {
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
