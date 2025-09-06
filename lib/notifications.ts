import { WebSocketManager } from './websocket'

export interface Notification {
	id: string
	type:
		| 'task_assigned'
		| 'task_completed'
		| 'comment_added'
		| 'project_updated'
		| 'member_added'
	title: string
	message: string
	userId: string
	projectId?: string
	taskId?: string
	createdAt: string
	read: boolean
}

export class NotificationManager {
	private wsManager: WebSocketManager
	private notifications: Notification[] = []
	private listeners: Set<(notifications: Notification[]) => void> = new Set()

	constructor(wsUrl: string) {
		this.wsManager = new WebSocketManager(wsUrl)
		this.setupWebSocketListeners()
	}

	private setupWebSocketListeners() {
		this.wsManager.on('notification', (notification: Notification) => {
			this.notifications.unshift(notification)
			this.notifyListeners()
			this.showBrowserNotification(notification)
		})
	}

	private showBrowserNotification(notification: Notification) {
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification(notification.title, {
				body: notification.message,
				icon: '/logo.png',
			})
		}
	}

	public requestNotificationPermission() {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission()
		}
	}

	public subscribe(callback: (notifications: Notification[]) => void) {
		this.listeners.add(callback)
		callback(this.notifications)
	}

	public unsubscribe(callback: (notifications: Notification[]) => void) {
		this.listeners.delete(callback)
	}

	private notifyListeners() {
		this.listeners.forEach((callback) => callback(this.notifications))
	}

	public markAsRead(notificationId: string) {
		const notification = this.notifications.find((n) => n.id === notificationId)
		if (notification) {
			notification.read = true
			this.notifyListeners()
			// Send to server
			this.wsManager.send('mark_notification_read', { notificationId })
		}
	}

	public markAllAsRead() {
		this.notifications.forEach((n) => (n.read = true))
		this.notifyListeners()
		this.wsManager.send('mark_all_notifications_read', {})
	}

	public getUnreadCount() {
		return this.notifications.filter((n) => !n.read).length
	}
}
