'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Notifications } from '@/types'

interface NotificationStore {
	notifications: Notifications[]
	unreadCount: number

	// Actions
	addNotification: (
		notification: Omit<Notifications, 'id' | 'timestamp' | 'read'>,
	) => Notifications
	markAsRead: (id: string) => void
	markAllAsRead: () => void
	deleteNotification: (id: string) => void
	clearAll: () => void

	// Computed
	getUnreadNotifications: () => Notifications[]
	updateUnreadCount: () => void
}

export const useNotificationStore = create<NotificationStore>()(
	persist(
		(set, get) => ({
			notifications: [],
			unreadCount: 0,

			addNotification: (notificationData) => {
				const newNotification: Notifications = {
					...notificationData,
					id: crypto.randomUUID(),
					timestamp: new Date(),
					read: false,
				}

				set((state) => {
					const updatedNotifications = [
						newNotification,
						...state.notifications,
					].slice(0, 100)
					const unreadCount = updatedNotifications.filter((n) => !n.read).length

					return {
						notifications: updatedNotifications,
						unreadCount,
					}
				})

				// Show browser notification for high priority
				if (notificationData.priority === 'high' && 'Notification' in window) {
					if (Notification.permission === 'granted') {
						const browserNotification = new Notification(
							notificationData.title,
							{
								body: notificationData.message,
								icon: '/icon-192.png',
								tag: newNotification.id,
							},
						)

						browserNotification.onclick = () => {
							window.focus()
							if (notificationData.actionUrl) {
								window.location.href = notificationData.actionUrl
							}
							browserNotification.close()
						}
					}
				}

				return newNotification
			},

			markAsRead: (id) => {
				set((state) => {
					const updatedNotifications = state.notifications.map((notification) =>
						notification.id === id
							? { ...notification, read: true }
							: notification,
					)
					const unreadCount = updatedNotifications.filter((n) => !n.read).length

					return {
						notifications: updatedNotifications,
						unreadCount,
					}
				})
			},

			markAllAsRead: () => {
				set((state) => ({
					notifications: state.notifications.map((notification) => ({
						...notification,
						read: true,
					})),
					unreadCount: 0,
				}))
			},

			deleteNotification: (id) => {
				set((state) => {
					const updatedNotifications = state.notifications.filter(
						(n) => n.id !== id,
					)
					const unreadCount = updatedNotifications.filter((n) => !n.read).length

					return {
						notifications: updatedNotifications,
						unreadCount,
					}
				})
			},

			clearAll: () => {
				set({ notifications: [], unreadCount: 0 })
			},

			getUnreadNotifications: () => {
				return get().notifications.filter((n) => !n.read)
			},

			updateUnreadCount: () => {
				set((state) => ({
					unreadCount: state.notifications.filter((n) => !n.read).length,
				}))
			},
		}),
		{
			name: 'taskflow-notifications',
			partialize: (state) => ({
				notifications: state.notifications.slice(0, 50), // Only persist last 50
			}),
		},
	),
)
