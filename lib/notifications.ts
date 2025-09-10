'use client'
import { Notifications, NotificationPreferences } from '@/types'

export class NotificationManager {
	private notifications: Notifications[] = []
	private listeners: Set<(notifications: Notifications[]) => void> = new Set()

	constructor() {
		if (typeof window !== 'undefined') {
			this.loadFromStorage()
			this.requestPermission()
		}
	}

	// Request browser notification permission
	async requestPermission(): Promise<boolean> {
		if (!('Notification' in window)) {
			console.log('This browser does not support notifications')
			return false
		}

		if (Notification.permission === 'granted') {
			return true
		}

		if (Notification.permission !== 'denied') {
			const permission = await Notification.requestPermission()
			return permission === 'granted'
		}

		return false
	}

	// Add notification
	addNotification(
		notification: Omit<Notifications, 'id' | 'timestamp' | 'read'>,
	): Notifications {
		const newNotification: Notifications = {
			...notification,
			id: crypto.randomUUID(),
			timestamp: new Date(),
			read: false,
		}

		this.notifications.unshift(newNotification)

		// Keep only last 100 notifications
		if (this.notifications.length > 100) {
			this.notifications = this.notifications.slice(0, 100)
		}

		this.saveToStorage()
		this.notifyListeners()

		// Show browser notification for high priority
		if (notification.priority === 'high') {
			this.showBrowserNotification(newNotification)
		}

		return newNotification
	}

	// Show browser notification
	private async showBrowserNotification(notification: Notifications) {
		const hasPermission = await this.requestPermission()
		if (!hasPermission) return

		const browserNotification = new Notification(notification.title, {
			body: notification.message,
			icon: '/icon-192.png',
			tag: notification.id,
			requireInteraction: notification.priority === 'high',
		})

		browserNotification.onclick = () => {
			window.focus()
			if (notification.actionUrl) {
				window.location.href = notification.actionUrl
			}
			browserNotification.close()
		}

		// Auto close after 5 seconds for non-high priority
		if (notification.priority !== 'high') {
			setTimeout(() => browserNotification.close(), 5000)
		}
	}

	// Get all notifications
	getNotifications(): Notifications[] {
		return [...this.notifications]
	}

	// Get unread notifications
	getUnreadNotifications(): Notifications[] {
		return this.notifications.filter((n) => !n.read)
	}

	// Get unread count
	getUnreadCount(): number {
		return this.notifications.filter((n) => !n.read).length
	}

	// Mark as read
	markAsRead(id: string): void {
		const notification = this.notifications.find((n) => n.id === id)
		if (notification && !notification.read) {
			notification.read = true
			this.saveToStorage()
			this.notifyListeners()
		}
	}

	// Mark all as read
	markAllAsRead(): void {
		let hasChanges = false
		this.notifications.forEach((notification) => {
			if (!notification.read) {
				notification.read = true
				hasChanges = true
			}
		})

		if (hasChanges) {
			this.saveToStorage()
			this.notifyListeners()
		}
	}

	// Delete notification
	deleteNotification(id: string): void {
		const index = this.notifications.findIndex((n) => n.id === id)
		if (index !== -1) {
			this.notifications.splice(index, 1)
			this.saveToStorage()
			this.notifyListeners()
		}
	}

	// Clear all notifications
	clearAll(): void {
		this.notifications = []
		this.saveToStorage()
		this.notifyListeners()
	}

	// Subscribe to changes
	subscribe(listener: (notifications: Notifications[]) => void): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	// Notify all listeners
	private notifyListeners(): void {
		this.listeners.forEach((listener) => listener([...this.notifications]))
	}

	// Storage methods
	private saveToStorage(): void {
		if (typeof window !== 'undefined') {
			localStorage.setItem(
				'taskflow_notifications',
				JSON.stringify(this.notifications),
			)
		}
	}

	private loadFromStorage(): void {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('taskflow_notifications')
			if (stored) {
				try {
					const parsed = JSON.parse(stored)
					this.notifications = parsed.map((n: Notifications) => ({
						...n,
						timestamp: new Date(n.timestamp),
					}))
				} catch (error) {
					console.error('Failed to load notifications from storage:', error)
				}
			}
		}
	}
}

export const notificationManager = new NotificationManager()
